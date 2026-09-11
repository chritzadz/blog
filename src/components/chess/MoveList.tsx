"use client";

import { useEffect, useRef } from "react";

interface MoveListProps {
  history: string[];
}

export default function MoveList({ history }: MoveListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [history.length]);

  const rows: { no: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({ no: i / 2 + 1, white: history[i], black: history[i + 1] });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col border border-slate-700 bg-[#171b20]">
      <p className="border-b border-slate-700 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-400">
        Moves
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 text-xs">
        {rows.length === 0 ? (
          <p className="text-slate-500">No moves yet.</p>
        ) : (
          <table className="w-full font-mono text-slate-200">
            <tbody>
              {rows.map((row) => (
                <tr key={row.no} className="odd:bg-white/5">
                  <td className="w-8 px-1 py-0.5 text-right text-slate-500">{row.no}.</td>
                  <td className="px-2 py-0.5">{row.white}</td>
                  <td className="px-2 py-0.5">{row.black ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
