"use client";

import React from "react";

interface SquareProps {
  isLight: boolean;
  isSelected: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  marker: "move" | "capture" | null;
  rankLabel?: string;
  fileLabel?: string;
  dimmed?: boolean;
  className?: string;
  children?: React.ReactNode;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const LIGHT = "#dde3e8";
const DARK = "#7c9bbf";

export default function Square({
  isLight,
  isSelected,
  isLastMove,
  isCheck,
  marker,
  rankLabel,
  fileLabel,
  dimmed,
  className,
  children,
  onPointerDown,
}: SquareProps) {
  return (
    <div
      className={`relative h-full w-full touch-none select-none ${className ?? ""}`}
      style={{ backgroundColor: isLight ? LIGHT : DARK }}
      onPointerDown={onPointerDown}
    >
      {isLastMove && <div className="absolute inset-0 bg-sky-300/50" />}
      {isSelected && (
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_3px_rgba(30,90,180,0.8)]" />
      )}
      {isCheck && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,40,40,0.85) 0%, rgba(255,40,40,0.35) 55%, transparent 75%)",
          }}
        />
      )}
      {dimmed && <div className="pointer-events-none absolute inset-0 bg-black/50" />}
      {marker === "move" && !children && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="block h-[32%] w-[32%] rounded-full bg-black/20" />
        </span>
      )}
      {marker === "capture" && (
        <span className="pointer-events-none absolute inset-[4%] rounded-full border-[3px] border-black/25" />
      )}
      {rankLabel && (
        <span
          className="pointer-events-none absolute left-0.5 top-0 text-[clamp(7px,1.8vw,11px)] font-bold"
          style={{ color: isLight ? DARK : LIGHT }}
        >
          {rankLabel}
        </span>
      )}
      {fileLabel && (
        <span
          className="pointer-events-none absolute bottom-0 right-0.5 text-[clamp(7px,1.8vw,11px)] font-bold"
          style={{ color: isLight ? DARK : LIGHT }}
        >
          {fileLabel}
        </span>
      )}
      {children}
    </div>
  );
}
