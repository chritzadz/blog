"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";

import {
  type BoardCell,
  pieceImageSrc,
  squareToIndices,
} from "@/lib/chess/notation";

interface PieceProps {
  square: string;
  cell: BoardCell;
  /** Origin square of the move that brought the piece here, for the slide-in. */
  slideFrom: string | null;
  orientation: "white" | "black";
  /** True while this piece is the one being dragged (ghost renders instead). */
  lifted: boolean;
}

export default function Piece({ square, cell, slideFrom, orientation, lifted }: PieceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useLayoutEffect(() => {
    if (!slideFrom || animatedRef.current) return;
    animatedRef.current = true;
    const el = ref.current;
    const from = squareToIndices(slideFrom);
    const to = squareToIndices(square);
    if (!el || !from || !to) return;
    const flip = orientation === "black" ? -1 : 1;
    const dCol = (from.c - to.c) * flip;
    const dRow = (from.r - to.r) * flip;
    el.style.transition = "none";
    el.style.transform = `translate(${dCol * 100}%, ${dRow * 100}%)`;
    requestAnimationFrame(() => {
      el.style.transition = "transform 150ms ease-out";
      el.style.transform = "translate(0, 0)";
    });
  }, [slideFrom, square, orientation]);

  return (
    <div
      ref={ref}
      className={`relative h-full w-full ${lifted ? "opacity-25" : ""}`}
      style={{ willChange: "transform" }}
    >
      <Image
        src={pieceImageSrc(cell.piece, cell.color)}
        alt={`${cell.color} ${cell.piece} on ${square}`}
        width={72}
        height={72}
        draggable={false}
        className="pointer-events-none h-full w-full select-none drop-shadow-md"
        priority
      />
    </div>
  );
}
