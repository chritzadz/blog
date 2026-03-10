import { useDroppable } from "@dnd-kit/react";
import React from "react";

interface CellProps {
  id: string;
  children?: React.ReactNode;
  className?: string;
}

export const Cell = ({ id, children, className }: CellProps) => {
  const { isDropTarget, ref } = useDroppable({ id });
  return (
    <div
      ref={ref}
      className={`w-full h-full min-w-[40px] min-h-[40px] max-w-full max-h-full relative flex items-center justify-center ${isDropTarget ? "bg-blue-200" : ""}` + className}
    >
      {children}
    </div>
  );
};
