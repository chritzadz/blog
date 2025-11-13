"use client";

import React, { useState } from "react";
import Collapsible from "./Collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, CircleChevronRight } from "lucide-react";

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
    const [drawerOpen, setDrawerOpen] = useState(false)

    const computeHref = (sectionId: string, itemId?: string, explicitHref?: string) => {
        if (explicitHref) return explicitHref;
        const base = parentRef.replace(/\/$/, "")
        const sectionPath = `${base}/${sectionId}`

        if (itemId) {
            if (pathname === base) return `#${itemId}`
            if (pathname && (pathname === sectionPath || pathname.startsWith(sectionPath + '/'))) return `#${itemId}`
            return `${sectionPath}#${itemId}`
        }

        return `${sectionPath}`
    }

    return (
        // make the layout full viewport height so the aside can be sticky
        <div className="flex w-full h-screen gap-6">
            {
                !drawerOpen && (
                    <div className="lg:hidden pt-3 fixed">
                        <div className="h-10 bg-gray-800 rounded-tr-md rounded-br-md items-center justify-center flex" onClick={() => {setDrawerOpen(true);}}>
                            <ChevronRight></ChevronRight>
                        </div>
                    </div>
                )
            }
            
            {/* desktop aside: add top offset so sticky works and limit height */}
            <aside className={`${sidebarWidth} hidden lg:block shrink-0 h-full p-4 bg-gray-800 sticky top-6 self-start` }>
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

            {drawerOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="text-sm pt-5 bg-gray-800 rounded" onClick={() => setDrawerOpen(false)}>
                        <div className="h-10rounded-tr-md rounded-br-md items-center justify-center flex">
                            <ChevronLeft></ChevronLeft>
                        </div>
                    </div>

                    <aside className={`${sidebarWidth} w-64 shrink-0 h-full p-4 bg-gray-800` }>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-semibold">{title}</h3>
                        </div>

                        <nav className="space-y-2">
                        {sections.map((s) => (
                            <div key={s.id}>
                            <Collapsible title={s.title} id={s.id} relativeRefParent={parentRef}>
                                <ul className="">
                                {(s.items || []).map((it) => {
                                    const href = computeHref(s.id, it.id, it.href)
                                    return (
                                    <li key={it.id}>
                                        <Link
                                            href={href}
                                            onClick={() => setDrawerOpen(false)}
                                            className="block px-2 text-sm rounded hover:text-gray-400 duration-200 ease-in-out"
                                        >
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
                </div>
            )}

            {/* make main scrollable so aside can stick while content scrolls */}
            <main className="flex-1 py-10 px-10 overflow-auto">{children}</main>
        </div>
    );
}
