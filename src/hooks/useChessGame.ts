"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { isSquareAttacked } from "@/lib/chess/attack";
import {
  type BoardGrid,
  applyMoveLocally,
  boardToFen,
  diffLastMove,
  fenSideToMove,
  findKing,
  type MoveDelta,
  parseFen,
  samePlacement,
  START_FEN,
} from "@/lib/chess/notation";
import { parseServerFrame } from "@/lib/chess/protocol";
import { chessSounds } from "@/lib/chess/sound";
import type { PieceMoves, SeatColor, Winner } from "@/lib/chess/types";

export type GameStatus =
  | "idle"
  | "connecting"
  | "waiting"
  | "playing"
  | "reconnecting"
  | "ended"
  | "disconnected";

export interface ChessGame {
  status: GameStatus;
  seat: SeatColor | "";
  myTurn: boolean;
  /** Latest server FEN (or start position while waiting). Never mutated locally. */
  fen: string;
  board: BoardGrid;
  /** Legal destinations keyed by origin square; only populated for my side to move. */
  legalByPiece: Record<string, string[]>;
  lastMove: MoveDelta | null;
  history: string[];
  checkSquare: string | null;
  /** A move has been sent and we are waiting for the server echo. */
  pending: boolean;
  error: string | null;
  winner: Winner | null;
  sendMove: (from: string, to: string) => void;
  reconnect: () => void;
}

const MOVE_TIMEOUT_MS = 6000;
const ERROR_TTL_MS = 4500;
const MOVE_RE = /^[a-h][1-8][a-h][1-8]$/;
const RECONNECT_DELAY_MS = 600;
const PLAYER_ID_KEY = "chess-pla...d";

const rejoinKey = (gameId: string) => `chess-rejoin:${gameId}`;

/** One unacknowledged, locally-applied move (only ever one, input is locked). */
interface OptimisticMove {
  from: string;
  to: string;
  board: BoardGrid;
  fen: string;
  captured: boolean;
}

export function getPlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = window.sessionStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = `p-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
    window.sessionStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

function websocketBaseUrl(): string {
  const base =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_CHESS_WEBSOCKET_URL_PROD
      : process.env.NEXT_PUBLIC_CHESS_WEBSOCKET_URL;
  return base || "ws://localhost:8080";
}

function apiBaseUrl(): string {
  const base =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_CHESS_API_URL_PROD
      : process.env.NEXT_PUBLIC_CHESS_API_URL;
  return base || "http://localhost:8080";
}

/**
 * Authoritative finished-game state. The server broadcasts END without a
 * final FEN, so the mating move is fetched from the persisted history.
 */
async function fetchEndState(
  gameId: string,
): Promise<{ moves: string[]; finalFen: string } | null> {
  try {
    const res = await fetch(`${apiBaseUrl()}/api/game/moves?id=${encodeURIComponent(gameId)}`);
    if (!res.ok) return null;
    const rows = (await res.json()) as { move?: string; fenAfter?: string }[];
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const last = rows[rows.length - 1];
    return {
      moves: rows.map((r) => r.move).filter((m): m is string => typeof m === "string"),
      finalFen: typeof last.fenAfter === "string" ? last.fenAfter : "",
    };
  } catch {
    return null;
  }
}

/** Used when a rejoin discovers the game already finished server-side. */
async function fetchGameResult(gameId: string): Promise<Winner | null> {
  try {
    const res = await fetch(`${apiBaseUrl()}/api/game/id?id=${encodeURIComponent(gameId)}`);
    if (!res.ok) return null;
    const row = (await res.json()) as { result?: string };
    const result = (row.result ?? "").toUpperCase();
    return result === "WHITE" || result === "BLACK" || result === "DRAW" ? result : null;
  } catch {
    return null;
  }
}

export function useChessGame(gameId: string): ChessGame {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<GameStatus>(() => (gameId ? "connecting" : "idle"));
  const [seat, setSeat] = useState<SeatColor | "">("");
  const [fen, setFen] = useState("");
  const [legalMoves, setLegalMoves] = useState<PieceMoves[]>([]);
  const [lastMove, setLastMove] = useState<MoveDelta | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [optimistic, setOptimistic] = useState<OptimisticMove | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const pendingTimerRef = useRef<number | null>(null);
  const errorTimerRef = useRef<number | null>(null);
  const optimisticRef = useRef<OptimisticMove | null>(null);

  useEffect(() => {
    optimisticRef.current = optimistic;
  }, [optimistic]);

  const revertOptimistic = useCallback(() => {
    optimisticRef.current = null;
    setOptimistic(null);
  }, []);

  const clearPending = useCallback(() => {
    setPending(false);
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  }, []);

  const raiseError = useCallback((message: string) => {
    chessSounds.error();
    setError(message);
    if (errorTimerRef.current !== null) window.clearTimeout(errorTimerRef.current);
    errorTimerRef.current = window.setTimeout(() => setError(null), ERROR_TTL_MS);
  }, []);

  // Reset game state during render when the game identity changes (React's
  // derived-reset pattern). Reconnect attempts intentionally do NOT reset,
  // so the board/history survive a REJOIN.
  const [trackedGameId, setTrackedGameId] = useState(gameId);
  if (trackedGameId !== gameId) {
    setTrackedGameId(gameId);
    setFen("");
    setLegalMoves([]);
    setLastMove(null);
    setHistory([]);
    setSeat("");
    setWinner(null);
    setError(null);
    setPending(false);
    setOptimistic(null);
    setStatus(gameId ? "connecting" : "idle");
  }

  useEffect(() => {
    if (!gameId) return undefined;

    // Per-connection closure state.
    let prevBoard: BoardGrid | null = null;
    let currentFen = "";
    let ended = false;
    let teardown = false;
    let cancelled = false;
    let registered = false;
    let usedToken = false;
    let rotatedId = false;

    const token = window.sessionStorage.getItem(rejoinKey(gameId));

    const retrySoon = (ms: number) => {
      window.setTimeout(() => {
        if (!cancelled && !teardown && !ended) setAttempt((a) => a + 1);
      }, ms);
    };

    /** Pull the authoritative final position/result once the game is over. */
    const settleFinished = (winnerFromFrame: Winner | null) => {
      window.sessionStorage.removeItem(rejoinKey(gameId));
      void Promise.all([
        winnerFromFrame ? Promise.resolve(winnerFromFrame) : fetchGameResult(gameId),
        fetchEndState(gameId),
      ]).then(([result, end]) => {
        if (cancelled) return;
        if (result) setWinner(result);
        if (end) {
          setHistory(end.moves);
          if (end.finalFen) {
            if (currentFen && end.finalFen !== currentFen) {
              const delta = diffLastMove(parseFen(currentFen), parseFen(end.finalFen));
              if (delta) setLastMove(delta);
            }
            currentFen = end.finalFen;
            prevBoard = parseFen(end.finalFen);
            setFen(end.finalFen);
          }
        }
        setStatus("ended");
      });
    };

    const socket = new WebSocket(`${websocketBaseUrl()}/game?id=${encodeURIComponent(gameId)}`);
    socketRef.current = socket;

    socket.onopen = () => {
      usedToken = Boolean(token);
      socket.send(usedToken ? `REJOIN:${token}` : `USER:${getPlayerId()}`);
    };

    socket.onmessage = (event) => {
      const frame = parseServerFrame(event.data);
      switch (frame.kind) {
        case "registered":
          registered = true;
          setSeat(frame.color);
          setStatus((prev) => (prev === "ended" ? prev : "waiting"));
          if (frame.token) window.sessionStorage.setItem(rejoinKey(gameId), frame.token);
          break;
        case "fen": {
          registered = true;
          const nextBoard = parseFen(frame.fen);
          const opt = optimisticRef.current;
          const echoOfOwnMove = !!opt && samePlacement(opt.board, nextBoard);
          const delta = diffLastMove(prevBoard, nextBoard);
          prevBoard = nextBoard;
          currentFen = frame.fen;
          setFen(frame.fen);
          clearPending();
          if (opt) revertOptimistic();
          setStatus((prev) => (prev === "ended" ? prev : "playing"));
          if (delta) {
            setLastMove(delta);
            setHistory((prev) => [...prev, `${delta.from}${delta.to}`]);
            // Our own echo already sounded when the move was sent.
            if (!echoOfOwnMove) {
              if (delta.captured) chessSounds.capture();
              else chessSounds.move();
            }
          }
          break;
        }
        case "moves":
          setLegalMoves(frame.payload.pieceMoves);
          break;
        case "end":
          ended = true;
          clearPending();
          revertOptimistic();
          setWinner(frame.winner);
          setStatus("ended");
          chessSounds.end();
          settleFinished(frame.winner);
          break;
        case "error": {
          clearPending();
          // Any rejection (and any special-case below) rolls the board back;
          // a REJOIN re-broadcast reconciles automatically.
          revertOptimistic();
          const msg = frame.message;
          // Stale rejoin token or game evicted from memory: drop the token
          // and re-register as a fresh USER (or learn the game is over).
          if (usedToken && (msg === "Unknown rejoin token" || msg === "Game not found")) {
            window.sessionStorage.removeItem(rejoinKey(gameId));
            retrySoon(200);
            break;
          }
          // Dev StrictMode double-connect or a half-closed ghost seat.
          if (
            (msg === "User ID already registered" || msg === "Game is full") &&
            !registered &&
            !rotatedId
          ) {
            rotatedId = true;
            window.sessionStorage.removeItem(PLAYER_ID_KEY);
            retrySoon(200);
            break;
          }
          if (msg === "Game is over") {
            ended = true;
            settleFinished(null);
            break;
          }
          raiseError(msg);
          break;
        }
        default:
          console.warn("[chess] unrecognized frame:", frame.raw);
      }
    };

    socket.onerror = () => {
      /* close follows and is handled there */
    };

    socket.onclose = () => {
      if (ended || teardown || cancelled) return;
      clearPending();
      if (registered) {
        // Seat + token survive a drop for ~60s server-side: try one REJOIN.
        setStatus("reconnecting");
        retrySoon(RECONNECT_DELAY_MS);
        return;
      }
      setStatus("disconnected");
    };

    return () => {
      teardown = true;
      cancelled = true;
      socket.onmessage = null;
      socket.onopen = null;
      socket.onclose = null;
      socket.onerror = null;
      socket.close();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [gameId, attempt, clearPending, raiseError, revertOptimistic]);

  useEffect(
    () => () => {
      if (pendingTimerRef.current !== null) window.clearTimeout(pendingTimerRef.current);
      if (errorTimerRef.current !== null) window.clearTimeout(errorTimerRef.current);
    },
    [],
  );

  // ---- display values: optimistic overlay when a move is in flight ----
  const displayBoard = useMemo<BoardGrid>(
    () => (optimistic ? optimistic.board : parseFen(fen || START_FEN)),
    [optimistic, fen],
  );
  const effectiveFen = optimistic ? optimistic.fen : fen;

  const myTurn =
    !!seat && !!effectiveFen && fenSideToMove(effectiveFen) === (seat === "White" ? "w" : "b");

  const legalByPiece = useMemo(() => {
    if (!myTurn || pending) return {};
    const map: Record<string, string[]> = {};
    const myColor = seat === "White" ? "WHITE" : "BLACK";
    legalMoves.forEach((m) => {
      if (!m.color || m.color === myColor) map[m.piece] = m.moves;
    });
    return map;
  }, [myTurn, pending, seat, legalMoves]);

  const checkSquare = useMemo(() => {
    if (!effectiveFen) return null;
    const side = fenSideToMove(effectiveFen);
    const kingSquare = findKing(displayBoard, side === "w" ? "white" : "black");
    if (!kingSquare) return null;
    return isSquareAttacked(displayBoard, kingSquare, side === "w" ? "black" : "white")
      ? kingSquare
      : null;
  }, [displayBoard, effectiveFen]);

  const displayLastMove: MoveDelta | null = optimistic
    ? { from: optimistic.from, to: optimistic.to, captured: optimistic.captured }
    : lastMove;

  const displayHistory = useMemo(
    () => (optimistic ? [...history, `${optimistic.from}${optimistic.to}`] : history),
    [history, optimistic],
  );

  const prevCheckRef = useRef<string | null>(null);
  useEffect(() => {
    if (checkSquare && checkSquare !== prevCheckRef.current) chessSounds.check();
    prevCheckRef.current = checkSquare;
  }, [checkSquare]);

  const sendMove = useCallback(
    (from: string, to: string) => {
      const move = `${from}${to}`;
      if (status !== "playing" || !MOVE_RE.test(move) || pending || !myTurn) return;
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      socket.send(move);

      // Render instantly; the next server FEN confirms or rolls us back.
      const applied = applyMoveLocally(displayBoard, from, to);
      if (applied) {
        const side: "w" | "b" = fenSideToMove(fen || START_FEN) === "w" ? "b" : "w";
        const opt: OptimisticMove = {
          from,
          to,
          board: applied.board,
          fen: boardToFen(applied.board, side),
          captured: applied.captured,
        };
        optimisticRef.current = opt;
        setOptimistic(opt);
        if (applied.captured) chessSounds.capture();
        else chessSounds.move();
      }

      setPending(true);
      if (pendingTimerRef.current !== null) window.clearTimeout(pendingTimerRef.current);
      // Safety valve: if the server echo never arrives, unblock the UI.
      pendingTimerRef.current = window.setTimeout(() => setPending(false), MOVE_TIMEOUT_MS);
    },
    [displayBoard, fen, myTurn, pending, status],
  );

  const reconnect = useCallback(() => {
    if (status === "ended") return;
    if (status === "disconnected") {
      window.sessionStorage.removeItem(rejoinKey(gameId));
    }
    setAttempt((a) => a + 1);
  }, [status, gameId]);

  return {
    status,
    seat,
    myTurn,
    fen,
    board: displayBoard,
    legalByPiece,
    lastMove: displayLastMove,
    history: displayHistory,
    checkSquare,
    pending,
    error,
    winner,
    sendMove,
    reconnect,
  };
}
