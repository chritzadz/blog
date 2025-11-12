"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type Props = {
    text: string;
    href: string;
    className?: string;
    ariaLabel?: string;
};

export default function NextCard({ text, href, className = "", ariaLabel }: Props) {
    const [hover, setHover] = useState(false);

    return (
        <Link
            href={href}
            aria-label={ariaLabel ?? text}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
        <div className={`w-1/2 flex items-center justify-between ${className}`}>
            <div className="text-sm text-white">{text}</div>
            <ArrowUpRight></ArrowUpRight>
        </div>

        <span
            aria-hidden
            className="w-1/2"
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
        </Link>
    );
}
