import type { MoveColor, MovesPayload, PieceMoves, SeatColor, Winner } from "./types";

export type ServerFrame =
  | { kind: "registered"; color: SeatColor; token?: string }
  | { kind: "fen"; fen: string; turn: MoveColor }
  | { kind: "moves"; payload: MovesPayload }
  | { kind: "end"; winner: Winner }
  | { kind: "error"; message: string }
  | { kind: "unknown"; raw: string };

// Spec: ^[rnbqkpRNBQKP1-8/]+ [wb]( .*)?$ — tightened to require 8 rank groups.
const FEN_RE = /^(?:[rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+ [wb](?:\s.*)?$/;

function parseMovesPayload(json: string): MovesPayload | null {
  try {
    const data = JSON.parse(json) as Partial<MovesPayload> | null;
    if (!data || !Array.isArray(data.pieceMoves)) return null;
    const pieceMoves = data.pieceMoves.filter(
      (m): m is PieceMoves => Boolean(m) && typeof m.piece === "string" && Array.isArray(m.moves),
    );
    return { turn: data.turn === "BLACK" ? "BLACK" : "WHITE", pieceMoves };
  } catch {
    return null;
  }
}

export function parseServerFrame(data: unknown): ServerFrame {
  const text = typeof data === "string" ? data.trim() : "";
  if (!text) return { kind: "unknown", raw: String(data ?? "") };

  if (text.startsWith("REGISTERED:")) {
    // New backend: REGISTERED:<White|Black>:<rejoin-token>. Old: REGISTERED:<White|Black>.
    const [seat, token] = text.slice("REGISTERED:".length).split(":");
    if (seat === "White" || seat === "Black") {
      return { kind: "registered", color: seat, token: token || undefined };
    }
  }
  if (text.startsWith("MOVES:")) {
    const payload = parseMovesPayload(text.slice("MOVES:".length));
    if (payload) return { kind: "moves", payload };
  }
  if (text.startsWith("END:")) {
    const winner = text.slice("END:".length).toUpperCase();
    if (winner === "WHITE" || winner === "BLACK" || winner === "DRAW") return { kind: "end", winner };
  }
  if (text.startsWith("ERROR:")) {
    return { kind: "error", message: text.slice("ERROR:".length).trim() || "Server error" };
  }
  if (FEN_RE.test(text)) {
    const sideField = text.split(" ")[1];
    return { kind: "fen", fen: text, turn: sideField === "b" ? "BLACK" : "WHITE" };
  }
  return { kind: "unknown", raw: text };
}
