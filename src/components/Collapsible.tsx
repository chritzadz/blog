"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

type Props = {
    title: string;
    children?: React.ReactNode;
    className?: string;
    relativeRefParent: string;
    id: string;
};

export default function Collapsible({ relativeRefParent, id, title, children, className = "" }: Props) {
    const [hover, setHover] = useState(false);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [contentHeight, setContentHeight] = useState<number>(0);

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        const measure = () => setContentHeight(el.scrollHeight);
        measure();

        const ro = new ResizeObserver(() => measure());
        ro.observe(el);
        return () => ro.disconnect();
    }, [children]);

    return (
        <div className={`w-full ${className}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <button
                type="button"
                className="group flex w-full items-center justify-between px-2 py-1 text-left text-sm text-white rounded"
            >
                <div className="w-full">
                    <div className="flex items-center justify-between">
                        {/* use Link so users can middle-click/open-in-new-tab */}
                        <h1 className="text-lg font-bold">
                            <Link href={`${relativeRefParent}/${id}`}>{title}</Link>
                        </h1>
                    </div>

                    <span
                        aria-hidden
                        style={{
                            display: "block",
                            height: 2,
                            background: "currentColor",
                            transformOrigin: "left",
                            transform: hover ? "scaleX(1)" : "scaleX(0)",
                            transition: "transform 220ms ease",
                            marginTop: 6,
                        }}
                    />
                </div>
            </button>

            <div ref={contentRef}
                style={{
                    maxHeight: hover ? `${contentHeight}px` : "0px",
                    opacity: hover ? 1 : 0,
                    transform: hover ? "translateY(0)" : "translateY(-6px)",
                    transition: "max-height 280ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease, transform 220ms ease",
                    overflow: "hidden",
                }}
                className={`mt-1 overflow-hidden transition-all duration-150 ${hover ? "max-h-96" : "max-h-0"}`}
            >
                {children}
            </div>
        </div>
    );
}
