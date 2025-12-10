"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Minus, Square } from "lucide-react";

interface WindowsWindowProps {
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  isActive?: boolean;
  icon?: React.ElementType;
  open: boolean;
  active: boolean;
  onFocus?: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
}

const WindowsWindow: React.FC<WindowsWindowProps> = ({
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  isActive = true,
  onFocus,
  onClose,
  onMinimize,
  open,
  icon: Icon,
  active
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onFocus) onFocus();

    // Only start drag if clicking the title bar
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
      if (isResizing) {
        setSize({
          width: Math.max(300, resizeStart.width + (e.clientX - resizeStart.x)),
          height: Math.max(200, resizeStart.height + (e.clientY - resizeStart.y)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  if (!open) return <></>;
  if (!active) return <></>

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col bg-white rounded-lg shadow-xl overflow-hidden ${
        isActive ? "z-50 shadow-2xl ring-1 ring-black/5" : "z-10 opacity-95"
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        minHeight: "200px",
        maxHeight: "90vh",
      }}
      onMouseDown={() => onFocus && onFocus()}
    >
      {/* Title Bar */}
      <div
        className={`flex justify-between select-none ${
          isActive ? "bg-white" : "bg-gray-50"
        } transition-colors duration-200`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3 px-2">
          {Icon && <Icon className="w-4 text-blue-500" />}
          <span className="font-medium text-sm text-gray-800 my-2">{title}</span>
        </div>

        {/* Window Controls */}
        <div className="">
          <button className="py-1.5 px-4 hover:bg-gray-100 transition-colors"
            onClick={onMinimize}>
            <Minus size={14} className="text-gray-500" />
          </button>
          <button className="py-1.5 px-4 hover:bg-gray-100 transition-colors">
            <Square size={12} className="text-gray-500" />
          </button>
          <button
            className="py-1.5 px-4 hover:bg-red-500 hover:text-white group transition-colors"
            onClick={onClose}
          >
            <X size={14} className="text-gray-500 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white/95 backdrop-blur-sm">
        {children}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};

export default WindowsWindow;
