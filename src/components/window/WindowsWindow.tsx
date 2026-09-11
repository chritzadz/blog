"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Minus, Square } from "lucide-react";

/** Space left at the bottom for the desktop taskbar. */
const TASKBAR_HEIGHT = 60;
/** Height of the title bar, kept visible while dragging. */
const TITLEBAR_HEIGHT = 36;

interface WindowsWindowProps {
  className?: string;
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  isActive?: boolean;
  icon?: React.ElementType;
  open: boolean;
  active: boolean;
  zIndex?: number;
  onFocus?: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
  fullscreen?: boolean;
}

const WindowsWindow: React.FC<WindowsWindowProps> = ({
  className,
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  isActive = true,
  onFocus,
  onClose,
  onMinimize,
  open,
  icon: Icon,
  active,
  zIndex = 40,
  fullscreen = false
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsFullscreen(fullscreen);
  }, [fullscreen]);

  // Keep at least a sliver of the window (and the whole title bar) on screen.
  const clampPosition = (p: { x: number; y: number }, w: number, h: number) => ({
    x: Math.min(Math.max(p.x, Math.min(80, w) - w), window.innerWidth - 80),
    y: Math.min(Math.max(p.y, 0), window.innerHeight - TASKBAR_HEIGHT - Math.min(h, TITLEBAR_HEIGHT)),
  });

  const releaseCapture = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
  };

  // Pointer capture guarantees the up/cancel event always arrives at this
  // element, so a drag can never get "stuck" with a stale mouse state.
  const handleTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (onFocus) onFocus();
    if (e.button !== 0 || isFullscreen) return;
    // Clicking the window buttons must not start a drag.
    if ((e.target as HTMLElement).closest("button")) return;
    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handleTitlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    // Fail-safe: button was released out of the window and the up event lost.
    if (!e.buttons) {
      handleTitlePointerEnd(e);
      return;
    }
    setPosition(
      clampPosition(
        { x: e.clientX - dragOffsetRef.current.x, y: e.clientY - dragOffsetRef.current.y },
        size.width,
        size.height,
      ),
    );
  };

  const handleTitlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    releaseCapture(e);
    setIsDragging(false);
  };

  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.button !== 0 || isFullscreen) return;
    resizeStartRef.current = { x: e.clientX, y: e.clientY, width: size.width, height: size.height };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsResizing(true);
  };

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing) return;
    if (!e.buttons) {
      handleResizePointerEnd(e);
      return;
    }
    const base = resizeStartRef.current;
    setSize({
      width: Math.min(
        Math.max(300, base.width + (e.clientX - base.x)),
        window.innerWidth - position.x,
      ),
      height: Math.min(
        Math.max(200, base.height + (e.clientY - base.y)),
        window.innerHeight - position.y - TASKBAR_HEIGHT,
      ),
    });
  };

  const handleResizePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    releaseCapture(e);
    setIsResizing(false);
  };

  if (!open) return <></>;

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col rounded-lg shadow-xl overflow-hidden ${
        isActive ? "shadow-2xl ring-1 ring-black/5" : "opacity-95"
      } ${isFullscreen ? "fixed! left-0! top-0! min-w-0! min-h-0! max-h-none! max-w-none!" : ""} ${className ? className : "bg-white"}`}
      style={
        isFullscreen
          ? {
              left: 0,
              top: 0,
              width: "100vw",
              height: `calc(100vh - ${TASKBAR_HEIGHT}px)`,
              minHeight: 0,
              maxHeight: "none",
              minWidth: 0,
              maxWidth: "none",
              display: active ? undefined : "none",
              zIndex,
            }
          : {
              left: position.x,
              top: position.y,
              width: size.width,
              height: size.height,
              minHeight: "200px",
              maxHeight: "90vh",
              display: active ? undefined : "none",
              zIndex,
            }
      }
      onMouseDown={() => onFocus && onFocus()}
    >
      {/* Title Bar */}
      <div
        className={`flex justify-between select-none touch-none ${
          isActive ? "bg-white" : "bg-gray-50"
        } transition-colors duration-200 ${isDragging ? "cursor-grabbing" : ""}`}
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerEnd}
        onPointerCancel={handleTitlePointerEnd}
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
          <button className="py-1.5 px-4 hover:bg-gray-100 transition-colors"
            onClick={() => setIsFullscreen(f => !f)}>
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
      {!isFullscreen && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 touch-none"
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerEnd}
          onPointerCancel={handleResizePointerEnd}
        />
      )}
    </div>
  );
};

export default WindowsWindow;
