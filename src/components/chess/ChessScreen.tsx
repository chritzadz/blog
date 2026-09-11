"use client";

import { Check, Copy, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

import { useCreateChessGame } from "@/hooks/useCreateChessGame";
import { useLazyGetChessGame } from "@/hooks/useGetChessGame";
import { useChessGame } from "@/hooks/useChessGame";
import { chessSounds } from "@/lib/chess/sound";
import Board from "./Board";
import GameOverModal from "./GameOverModal";
import MoveList from "./MoveList";

interface ChessScreenProps {
  onGameStarted?: () => void;
  onLeaveGame?: () => void;
}

type Session = { mode: "lobby" } | { mode: "game"; id: string };

export default function ChessScreen({ onGameStarted, onLeaveGame }: ChessScreenProps) {
  const [session, setSession] = useState<Session>({ mode: "lobby" });
  const [inputId, setInputId] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const { mutate, isPending } = useCreateChessGame();
  const { getGame } = useLazyGetChessGame();
  const game = useChessGame(session.mode === "game" ? session.id : "");

  const startGame = (id: string) => {
    setSelected(null);
    setSession({ mode: "game", id });
    onGameStarted?.();
  };

  const backToLobby = () => {
    setSession({ mode: "lobby" });
    onLeaveGame?.();
  };

  const handleCreateGame = () => {
    setCreateError(null);
    mutate(undefined, {
      onSuccess: (result: unknown) => {
        const id =
          typeof result === "string" || typeof result === "number"
            ? String(result).trim()
            : "";
        if (!id) {
          setCreateError("The server did not return a game ID.");
          return;
        }
        startGame(id);
      },
      onError: (error: Error) => {
        setCreateError(error.message || "Unable to create a game.");
      },
    });
  };

  const handleJoinGame = async () => {
    const id = inputId.trim();
    if (!id) return;
    setJoinLoading(true);
    setJoinError(null);
    try {
      const result = await getGame(id);
      if (result) startGame(id);
      else setJoinError("Game not found");
    } catch {
      setJoinError("Game not found");
    } finally {
      setJoinLoading(false);
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    chessSounds.setMuted(next);
  };

  const copyGameId = async () => {
    try {
      await navigator.clipboard.writeText(session.mode === "game" ? session.id : "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (session.mode === "game") {
    const orientation = game.seat === "Black" ? "black" : "white";
    const interactive = game.status === "playing" && game.myTurn && !game.pending;
    const inLobbySeat = game.status === "connecting" || game.status === "waiting";
    return (
      <div className="flex min-h-full flex-col bg-[#20252b] p-4 font-sans text-slate-100">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live match</p>
              <p className="text-lg font-bold text-white">Game {session.id}</p>
            </div>
            <button
              type="button"
              onClick={copyGameId}
              className="flex items-center gap-1 border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:border-white hover:text-white"
              title="Copy game ID"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "ID"}
            </button>
            {game.seat && (
              <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider ${game.seat === "White" ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100 ring-1 ring-slate-500"}`}>
                {game.seat}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="border border-slate-600 p-2 text-slate-300 hover:border-white hover:text-white"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <button
              type="button"
              onClick={backToLobby}
              className="border border-slate-600 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:border-white hover:text-white"
            >
              Leave table
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div
              className="relative mx-auto w-full"
              style={{ maxWidth: "min(100%, calc(100vh - 200px))" }}
            >
              <Board
                board={game.board}
                orientation={orientation}
                myColor={game.seat === "White" ? "white" : game.seat === "Black" ? "black" : ""}
                legalByPiece={game.legalByPiece}
                interactive={interactive}
                selected={selected}
                onSelect={setSelected}
                onMove={game.sendMove}
                lastMove={game.lastMove}
                checkSquare={game.checkSquare}
              />
              {inLobbySeat && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#20252b]/85 p-6 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-sky-400" />
                  <div>
                    <p className="text-lg font-bold text-white">
                      {game.status === "connecting" ? "Connecting to table..." : "Waiting for opponent"}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Share game ID <b className="text-sky-400">{session.id}</b> so they can join.
                    </p>
                  </div>
                </div>
              )}
              {game.status === "ended" && game.winner && (
                <GameOverModal winner={game.winner} seat={game.seat} onBackToLobby={backToLobby} />
              )}
              {game.error && (
                <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap border border-red-500 bg-red-950/95 px-3 py-1.5 text-xs text-red-200">
                  {game.error}
                </div>
              )}
            </div>
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-60">
            <div className="border border-slate-700 bg-[#171b20] px-3 py-2 text-sm">
              {game.status === "playing" ? (
                game.pending ? (
                  <span className="text-sky-300">Waiting for server...</span>
                ) : game.myTurn ? (
                  <span className="font-bold text-emerald-400">Your move</span>
                ) : (
                  <span className="text-slate-400">Opponent is thinking</span>
                )
              ) : game.status === "reconnecting" ? (
                <span className="text-sky-300">Reconnecting to table...</span>
              ) : (
                <span className="text-slate-400 capitalize">{game.status}</span>
              )}
              <span className="float-right text-slate-500">
                {Math.ceil(game.history.length / 2) || 1}
              </span>
            </div>
            {game.status === "disconnected" && (
              <div className="flex items-center justify-between gap-2 border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-300">
                <span>Connection lost. Your seat is held ~60s - Retry to rejoin.</span>
                <button
                  type="button"
                  onClick={game.reconnect}
                  className="shrink-0 border border-red-500 px-2 py-1 font-bold uppercase hover:bg-red-500/20"
                >
                  Retry
                </button>
              </div>
            )}
            <div className="min-h-0 flex-1">
              <MoveList history={game.history} />
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#20252b] p-4 font-sans text-slate-100">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <div className="relative overflow-hidden border border-slate-700 bg-[#171b20] p-3 shadow-2xl">
          <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
            <span>Open board</span>
            <span className="text-emerald-400">Waiting room</span>
          </div>
          <Board
            board={game.board}
            orientation="white"
            myColor=""
            legalByPiece={{}}
            interactive={false}
            selected={null}
            onSelect={() => {}}
            onMove={() => {}}
            lastMove={null}
            checkSquare={null}
          />
        </div>
        <button
          type="button"
          className="w-full bg-sky-500 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-950/30 hover:bg-sky-400 disabled:cursor-wait disabled:opacity-60"
          onClick={handleCreateGame}
          disabled={isPending}
        >
          {isPending ? "Creating room..." : "Create new room"}
        </button>
        <div className="border-t border-slate-700 pt-4">
          <label htmlFor="game-id" className="mb-2 block text-xs uppercase tracking-wider text-slate-400">
            Join with game ID
          </label>
          <div className="flex gap-2">
            <input
              id="game-id"
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinGame()}
              placeholder="e.g. 8f3a2e1c-1b2c-4d5e-9f01-234567890abc"
              className="min-w-0 flex-1 border border-slate-600 bg-[#171b20] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400"
            />
            <button
              type="button"
              className="border border-slate-500 px-4 py-2 text-sm font-bold text-slate-200 hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
              onClick={handleJoinGame}
              disabled={!inputId.trim() || joinLoading}
            >
              {joinLoading ? "Checking" : "Join"}
            </button>
          </div>
        </div>
        {(createError || joinError) && (
          <div role="alert" className="border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {createError || joinError}
          </div>
        )}
      </div>
    </div>
  );
}
