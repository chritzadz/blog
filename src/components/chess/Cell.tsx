import { useDroppable } from "@dnd-kit/react";
import React from "react";

interface CellProps {
  id: string;
  children?: React.ReactNode;
}

export const Cell = ({ id, children }: CellProps) => {
  const { isDropTarget, ref } = useDroppable({ id });
  return (
    <div
      ref={ref}
      className={`w-12 h-12 relative flex items-center justify-center ${isDropTarget ? "bg-blue-200" : ""}`}
    >
      {children}
    </div>
  );
};
