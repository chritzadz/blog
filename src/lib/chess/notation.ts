export type PieceColor = "white" | "black";

export interface BoardCell {
  /** Uppercase letter: K Q R B N P */
  piece: string;
  color: PieceColor;
}

/** Board from White's perspective: index [0][0] is a8, [7][7] is h1. */
export type BoardGrid = (BoardCell | null)[][];

export interface MoveDelta {
  from: string;
  to: string;
  /** True when a piece left the board this ply (includes en passant and king captures). */
  captured: boolean;
}

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function squareName(rIdx: number, cIdx: number): string {
  return `${FILES[cIdx]}${8 - rIdx}`;
}

export function squareToIndices(square: string): { r: number; c: number } | null {
  if (!/^[a-h][1-8]$/.test(square)) return null;
  return { r: 8 - Number(square[1]), c: FILES.indexOf(square[0] as (typeof FILES)[number]) };
}

export function fenSideToMove(fen: string): "w" | "b" {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}

export function parseFen(fen: string): BoardGrid {
  const rows = fen.trim().split(" ")[0].split("/");
  const board: BoardGrid = Array.from({ length: 8 }, () => Array<BoardCell | null>(8).fill(null));
  rows.slice(0, 8).forEach((row, r) => {
    let c = 0;
    for (const ch of row) {
      if (/[1-8]/.test(ch)) {
        c += Number(ch);
      } else if (c < 8) {
        board[r][c] = {
          piece: ch.toUpperCase(),
          color: ch === ch.toLowerCase() ? "black" : "white",
        };
        c += 1;
      }
    }
  });
  return board;
}

export function pieceImageSrc(piece: string, color: PieceColor): string {
  return `/chess/${color === "white" ? piece : `${piece.toLowerCase()}_`}.png`;
}

export function findKing(board: BoardGrid, color: PieceColor): string | null {
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const cell = board[r][c];
      if (cell && cell.piece === "K" && cell.color === color) return squareName(r, c);
    }
  }
  return null;
}

function countPieces(board: BoardGrid): number {
  let n = 0;
  board.forEach((row) => row.forEach((cell) => { if (cell) n += 1; }));
  return n;
}

function changedSquares(prev: BoardGrid, next: BoardGrid) {
  const losses: { sq: string; cell: BoardCell }[] = [];
  const gains: { sq: string; cell: BoardCell }[] = [];
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const p = prev[r][c];
      const n = next[r][c];
      if (p && n && p.piece === n.piece && p.color === n.color) continue;
      const sq = squareName(r, c);
      if (p) losses.push({ sq, cell: p });
      if (n) gains.push({ sq, cell: n });
    }
  }
  return { losses, gains };
}

/**
 * Recover the from->to of the ply between two consecutive server FENs.
 * Handles quiet moves, captures, promotions (P->Q auto-queen), en passant and
 * castling (reported as the king hop). Returns null when no move is discernible.
 */
export function diffLastMove(prev: BoardGrid | null, next: BoardGrid): MoveDelta | null {
  if (!prev) return null;
  const captured = countPieces(prev) > countPieces(next);
  const { losses, gains } = changedSquares(prev, next);
  const gainSquares = new Set(gains.map((g) => g.sq));
  const origins = losses.filter((l) => !gainSquares.has(l.sq));

  if (gains.length === 1) {
    const g = gains[0];
    const candidates = origins.filter(
      (l) =>
        l.cell.color === g.cell.color &&
        (l.cell.piece === g.cell.piece ||
          (l.cell.piece === "P" && "QRBN".includes(g.cell.piece))),
    );
    if (candidates.length >= 1) return { from: candidates[0].sq, to: g.sq, captured };
  }
  if (gains.length === 2 && origins.length === 2) {
    const kingGain = gains.find((x) => x.cell.piece === "K");
    const kingLoss = origins.find((x) => x.cell.piece === "K");
    if (kingGain && kingLoss && kingGain.cell.color === kingLoss.cell.color) {
      return { from: kingLoss.sq, to: kingGain.sq, captured: false };
    }
  }
  return null;
}

/**
 * Apply a from-to move to a copy of the board, purely locally for the
 * optimistic render. Covers quiet moves, captures, auto-queen promotion,
 * en passant (geometry-detected since the backend FEN omits the ep field)
 * and castling (king 2-file hop moves the rook too).
 * Returns null when the move cannot be applied to this position.
 */
export function applyMoveLocally(
  board: BoardGrid,
  from: string,
  to: string,
): { board: BoardGrid; captured: boolean } | null {
  const f = squareToIndices(from);
  const t = squareToIndices(to);
  if (!f || !t) return null;
  const mover = board[f.r][f.c];
  if (!mover) return null;
  const target = board[t.r][t.c];
  if (target && target.color === mover.color) return null;

  const next = board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
  next[f.r][f.c] = null;
  let piece = mover;
  let captured = !!target;

  if (piece.piece === "P" && (t.r === 0 || t.r === 7)) {
    piece = { ...piece, piece: "Q" };
  }
  if (piece.piece === "P" && !target && f.c !== t.c) {
    const victim = next[f.r][t.c];
    if (victim && victim.piece === "P" && victim.color !== piece.color) {
      next[f.r][t.c] = null;
      captured = true;
    }
  }
  if (piece.piece === "K" && Math.abs(t.c - f.c) === 2) {
    const rookFromC = t.c > f.c ? 7 : 0;
    const rookToC = t.c > f.c ? t.c - 1 : t.c + 1;
    const rook = next[f.r][rookFromC];
    if (rook && rook.piece === "R" && rook.color === piece.color) {
      next[f.r][rookFromC] = null;
      next[f.r][rookToC] = { ...rook };
    }
  }
  next[t.r][t.c] = piece;
  return { board: next, captured };
}

/** Synthesize a placement FEN matching the backend's format from a board. */
export function boardToFen(board: BoardGrid, sideToMove: "w" | "b"): string {
  const rows = board.map((row) => {
    let s = "";
    let empty = 0;
    for (const cell of row) {
      if (!cell) {
        empty += 1;
        continue;
      }
      if (empty > 0) {
        s += empty;
        empty = 0;
      }
      s += cell.color === "white" ? cell.piece : cell.piece.toLowerCase();
    }
    if (empty > 0) s += empty;
    return s;
  });
  return `${rows.join("/")} ${sideToMove} - - 0 1`;
}

/** Placement-only equality, used to reconcile optimistic boards with the server echo. */
export function samePlacement(a: BoardGrid, b: BoardGrid): boolean {
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const x = a[r][c];
      const y = b[r][c];
      if (!x !== !y) return false;
      if (x && y && (x.piece !== y.piece || x.color !== y.color)) return false;
    }
  }
  return true;
}
