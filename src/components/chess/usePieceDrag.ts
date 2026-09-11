"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { FILES } from "@/lib/chess/notation";

/** Pixels of movement before a press becomes a drag (chess.com-like feel). */
const DRAG_THRESHOLD_PX = 6;

export interface DragVisual {
  from: string;
  x: number;
  y: number;
  size: number;
}

interface UsePieceDragOptions {
  boardRef: React.RefObject<HTMLDivElement | null>;
  orientation: "white" | "black";
  /**
   * Called when the pointer is released after a real drag.
   * `to` is null when the release landed off-board (snap back).
   */
  onDrop: (from: string, to: string | null) => void;
}

/**
 * Single pointer-event path that distinguishes click from drag for both mouse
 * and touch: pointerdown selects, movement past a small threshold turns it
 * into a drag (ghost follows the cursor), release on a legal square commits.
 * A click never starts a drag, so click-click moves keep working.
 */
export function usePieceDrag({ boardRef, orientation, onDrop }: UsePieceDragOptions) {
  const [drag, setDrag] = useState<DragVisual | null>(null);
  const pressRef = useRef<{
    from: string;
    startX: number;
    startY: number;
    active: boolean;
    move: (e: PointerEvent) => void;
    up: (e: PointerEvent) => void;
    cancel: () => void;
  } | null>(null);

  const latestRef = useRef({ orientation, onDrop });
  useEffect(() => {
    latestRef.current = { orientation, onDrop };
  });

  const detach = useCallback(() => {
    const press = pressRef.current;
    if (press) {
      window.removeEventListener("pointermove", press.move);
      window.removeEventListener("pointerup", press.up);
      window.removeEventListener("pointercancel", press.cancel);
      pressRef.current = null;
    }
    setDrag(null);
  }, []);

  const squareAtPoint = useCallback(
    (clientX: number, clientY: number): string | null => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return null;
      const col = Math.floor(((clientX - rect.left) / rect.width) * 8);
      const row = Math.floor(((clientY - rect.top) / rect.height) * 8);
      if (col < 0 || col > 7 || row < 0 || row > 7) return null;
      const { orientation: orient } = latestRef.current;
      if (orient === "white") return `${FILES[col]}${8 - row}`;
      return `${FILES[7 - col]}${row + 1}`;
    },
    [boardRef],
  );

  const start = useCallback(
    (from: string, e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();
      detach();
      const press: NonNullable<typeof pressRef.current> = {
        from,
        startX: e.clientX,
        startY: e.clientY,
        active: false,
        move: (ev) => {
          const p = pressRef.current;
          if (!p) return;
          if (!p.active) {
            const dist = Math.hypot(ev.clientX - p.startX, ev.clientY - p.startY);
            if (dist < DRAG_THRESHOLD_PX) return;
            p.active = true;
          }
          const rect = boardRef.current?.getBoundingClientRect();
          setDrag({
            from: p.from,
            x: ev.clientX,
            y: ev.clientY,
            size: rect ? rect.width / 8 : 48,
          });
        },
        up: (ev) => {
          const p = pressRef.current;
          detach();
          if (p?.active) {
            const to = squareAtPoint(ev.clientX, ev.clientY);
            latestRef.current.onDrop(p.from, to && to !== p.from ? to : null);
          }
        },
        cancel: () => detach(),
      };
      pressRef.current = press;
      window.addEventListener("pointermove", press.move);
      window.addEventListener("pointerup", press.up);
      window.addEventListener("pointercancel", press.cancel);
    },
    [boardRef, detach, squareAtPoint],
  );

  useEffect(() => detach, [detach]);

  return { drag, start };
}
