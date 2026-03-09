// eslint-disable
import { useDraggable } from "@dnd-kit/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";


export const PieceBox = ({id, rIdx, cIdx, cell, strPathImage, highlighted, onRequestMoves}: {
  id: string,
  rIdx: number,
  cIdx: number,
  cell: {color: string, piece:string},
  strPathImage: string | undefined,
  highlighted?: boolean,
  onRequestMoves?: (square: string) => void
}) => {
  const { ref, isDragging } = useDraggable({ id });
  const [selected, setSelected] = useState(false);
  const [closestSquare, setClosestSquare] = useState<string>("");
  const cellRef = useRef<HTMLDivElement>(null);

  // Chess notation mapping
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [8,7,6,5,4,3,2,1];
  const notation = files[cIdx] + ranks[rIdx];

  useEffect(() => {
    if (!isDragging) {
      setClosestSquare("");
      return;
    }
    // Find closest square to mouse
    const handleMouseMove = (e: MouseEvent) => {
      if (!cellRef.current) return;
      const rect = cellRef.current.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      // Check if mouse is inside this cell
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        if (closestSquare !== notation) setClosestSquare(notation);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [closestSquare, isDragging, notation]);

  const handleClick = () => {
    if (cell) setSelected(!selected);
    if (onRequestMoves) {
      onRequestMoves(notation);
    }
  };

  return (
    <div
      key={rIdx + "-" + cIdx}
      ref={cellRef}
      className={`w-12 h-12 relative flex items-center justify-center ${selected ? "bg-red-100" : ""} ${highlighted ? "ring-4 ring-yellow-400" : ""}`}
      onClick={handleClick}
    >
      {cell && (
        <div ref={ref} className={`cursor-grab flex items-center justify-center ${isDragging ? "bg-red-100" : ""}`} style={{width: '100%', height: '100%'}}>
          <Image
            src={strPathImage}
            alt={cell.color + " " + cell.piece}
            width={44}
            height={44}
            className="w-11 h-11"
            priority
          />
          {isDragging && closestSquare && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
              <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-bold">{closestSquare}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}