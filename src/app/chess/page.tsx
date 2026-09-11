"use client";

import ChessScreen from "@/components/chess/ChessScreen";

export default function ChessPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-primary-gray">
      <div className="bg-gray-400 min-w-[500px] min-h-[500px] flex items-center justify-center">
        <ChessScreen />
      </div>
    </div>
  );
}
