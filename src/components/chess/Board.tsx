"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useRef } from "react";

import {
  type BoardGrid,
  type MoveDelta,
  type PieceColor,
  pieceImageSrc,
  squareName,
  squareToIndices,
} from "@/lib/chess/notation";
import Piece from "./Piece";
import Square from "./Square";
import { usePieceDrag } from "./usePieceDrag";

interface BoardProps {
  board: BoardGrid;
  orientation: "white" | "black";
  myColor: PieceColor | "";
  /** Destination map for the pieces I may move right now. */
  legalByPiece: Record<string, string[]>;
  interactive: boolean;
  selected: string | null;
  onSelect: (square: string | null) => void;
  onMove: (from: string, to: string) => void;
  lastMove: MoveDelta | null;
  checkSquare: string | null;
}

export default function Board({
  board,
  orientation,
  myColor,
  legalByPiece,
  interactive,
  selected,
  onSelect,
  onMove,
  lastMove,
  checkSquare,
}: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef({ legalByPiece, onSelect, onMove });
  useLayoutEffect(() => {
    latestRef.current = { legalByPiece, onSelect, onMove };
  });

  const { drag, start } = usePieceDrag({
    boardRef,
    orientation,
    onDrop: (from, to) => {
      const { legalByPiece: legal, onSelect: select, onMove: move } = latestRef.current;
      if (to && (legal[from] ?? []).includes(to)) move(from, to);
      select(null);
    },
  });

  const handlePointerDown = useCallback(
    (square: string, e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      const { legalByPiece: legal, onSelect: select, onMove: move } = latestRef.current;
      if (selected && selected !== square && (legal[selected] ?? []).includes(square)) {
        move(selected, square);
        select(null);
        return;
      }
      const idx = squareToIndices(square);
      const cell = idx ? board[idx.r][idx.c] : null;
      if (myColor && cell?.color === myColor && (legal[square]?.length ?? 0) > 0) {
        select(square);
        start(square, e);
      } else {
        select(null);
      }
    },
    [interactive, selected, board, myColor, start],
  );

  const dragIdx = drag ? squareToIndices(drag.from) : null;
  const dragCell = dragIdx ? board[dragIdx.r][dragIdx.c] : null;

  const cells = [];
  for (let dr = 0; dr < 8; dr += 1) {
    for (let dc = 0; dc < 8; dc += 1) {
      const r = orientation === "white" ? dr : 7 - dr;
      const c = orientation === "white" ? dc : 7 - dc;
      const square = squareName(r, c);
      const cell = board[r][c];
      const dests = selected ? legalByPiece[selected] ?? [] : [];
      const isTarget = !!selected && selected !== square && dests.includes(square);
      cells.push(
        <Square
          key={square}
          isLight={(r + c) % 2 === 0}
          isSelected={selected === square}
          isLastMove={!!lastMove && (lastMove.from === square || lastMove.to === square)}
          isCheck={checkSquare === square}
          marker={isTarget ? (cell ? "capture" : "move") : null}
          rankLabel={dc === 0 ? square[1] : undefined}
          fileLabel={dr === 7 ? square[0] : undefined}
          onPointerDown={(e) => handlePointerDown(square, e)}
        >
          {cell && (
            <Piece
              key={`${cell.piece}${cell.color}`}
              square={square}
              cell={cell}
              slideFrom={lastMove && lastMove.to === square ? lastMove.from : null}
              orientation={orientation}
              lifted={drag?.from === square}
            />
          )}
        </Square>,
      );
    }
  }

  return (
    <div
      ref={boardRef}
      className="relative grid aspect-square w-full select-none grid-cols-8 grid-rows-8 overflow-hidden rounded border-2 border-[#31353b] shadow-2xl"
    >
      {cells}
      {drag && dragCell && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: drag.x - drag.size / 2,
            top: drag.y - drag.size / 2,
            width: drag.size,
            height: drag.size,
          }}
        >
          <Image
            src={pieceImageSrc(dragCell.piece, dragCell.color)}
            alt=""
            width={72}
            height={72}
            draggable={false}
            className="h-full w-full select-none drop-shadow-xl"
          />
        </div>
      )}
    </div>
  );
}
