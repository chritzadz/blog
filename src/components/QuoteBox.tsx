import React from "react";

type QuoteBoxProps = {
    children: React.ReactNode;
    cite?: string;
    className?: string;
    variant?: "default" | "emphasized";
};

export default function QuoteBox({
    children,
    cite,
    className = "",
    variant = "default",
}: QuoteBoxProps) {
    const base =
        "flex items-start gap-3 p-4 rounded-md italic text-slate-800 dark:text-slate-100";

    const styles =
        variant === "emphasized"
        ? "bg-yellow-50 border-l-4 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-600"
        : "bg-slate-50 border-l-4 border-slate-300 dark:bg-slate-900/40 dark:border-slate-700";

    return (
        <>
            <blockquote className={`${base} ${styles} ${className}`.trim()}>
                <span className="text-4xl leading-none text-slate-400 dark:text-slate-500 select-none">“</span>
                <div className="flex-1 text-center">
                    <div className="text-sm leading-relaxed">{children}</div>
                    {cite && (
                    <footer className="mt-2 text-sm text-slate-600 not-italic dark:text-slate-400">— {cite}</footer>
                    )}
                </div>
                <span className="text-4xl leading-none text-slate-400 dark:text-slate-500 select-none">{"”"}</span>
            </blockquote>
        </>
        
    );
}
