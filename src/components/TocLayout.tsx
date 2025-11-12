"use client";

import React from "react";
import Collapsible from "./Collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SubItem = { id: string; title: string; href?: string };
type Section = { id: string; title: string; items?: SubItem[] };

type Props = {
    title?: string;
    sections: Section[];
    children?: React.ReactNode;
    sidebarWidth?: string; // tailwind width class like 'w-60'
    parentRef: string;
};

export default function TocLayout({ title = "Contents", sections, parentRef, children, sidebarWidth = "w-72" }: Props) {
    const pathname = usePathname()

    const computeHref = (sectionId: string, itemId?: string, explicitHref?: string) => {
        if (explicitHref) return explicitHref;
        const base = parentRef.replace(/\/$/, "")
        const sectionPath = `${base}/${sectionId}`

        //otem id is the path.
        if (itemId) {
            if (pathname === base) return `#${itemId}`
            if (pathname && (pathname === sectionPath || pathname.startsWith(sectionPath + '/'))) return `#${itemId}`
            return `${sectionPath}#${itemId}`
        }

        return `${sectionPath}`
    }

    return (
        // make the layout full viewport height so the aside can be sticky
        <div className="flex w-full h-screen gap-6 ">
        <aside className={`${sidebarWidth} shrink-0 h-full p-4 bg-gray-800 sticky self-start` }>
            <h3 className="text-3xl font-semibold mb-3">{title + "."}</h3>

            <nav className="space-y-2">
            {sections.map((s) => (
                <div key={s.id}>
                <Collapsible title={s.title} id={s.id} relativeRefParent={parentRef}>
                    <ul className="">
                    {(s.items || []).map((it) => {
                        const href = computeHref(s.id, it.id, it.href)
                        return (
                        <li key={it.id}>
                            <Link href={href} className="block px-2 text-sm rounded hover:text-gray-400 duration-200 ease-in-out">
                                {it.title}
                            </Link>
                        </li>
                        )
                    })}
                    </ul>
                </Collapsible>
                </div>
            ))}
            </nav>
        </aside>

        {/* make main scrollable so the sidebar remains visible (sticky) */}
        <main className="flex-1 p-6 rounded-md overflow-auto">{children}</main>
        </div>
    );
}
