"use client";

import type { SeatColor, Winner } from "@/lib/chess/types";

interface GameOverModalProps {
  winner: Winner;
  seat: SeatColor | "";
  onBackToLobby: () => void;
}

export default function GameOverModal({ winner, seat, onBackToLobby }: GameOverModalProps) {
  const draw = winner === "DRAW";
  const winnerName = winner === "WHITE" ? "White" : "Black";
  const headline = draw ? "Draw — stalemate" : `${winnerName} wins`;
  const myColorWon = !draw && seat !== "" && winner === (seat === "White" ? "WHITE" : "BLACK");
  const subline = draw
    ? "No legal moves remained for the side to move."
    : seat === ""
      ? `${winnerName} won on ${winner === "WHITE" ? "the white" : "the black"} pieces.`
      : myColorWon
        ? `You played ${seat} — you won this game.`
        : `You played ${seat} — ${winnerName} took the game.`;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm border border-slate-600 bg-[#171b20] p-6 text-center shadow-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-400">Game over</p>
        <h2 className="mt-2 text-3xl font-bold text-sky-300">{headline}</h2>
        <p className="mt-2 text-sm text-slate-400">{subline}</p>
        <button
          type="button"
          onClick={onBackToLobby}
          className="mt-5 w-full bg-sky-500 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-sky-400"
        >
          Back to lobby
        </button>
      </div>
    </div>
  );
}
