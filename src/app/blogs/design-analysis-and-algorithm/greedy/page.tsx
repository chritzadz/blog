'use client';

import NextCard from "@/components/NextCard";
import { usePathname } from "next/navigation";

export default function Greedy() {
    const pathname = usePathname();
    const segments = pathname ? pathname.split('/').filter(Boolean) : [];
    const base = segments.length >= 2 ? `/${segments[0]}/${segments[1]}` : '/blogs/design-analysis-and-algorithm';
    const nextHref = `${base}/divide-and-conquer`;

    return (
        <div className="" style={{ fontFamily: '"Consolas", Times, serif' }}>
            <h1 className="text-6xl font-bold">Greedy</h1>
            <div className="mt-8">
                <div className="w-1/2">
                    <section id="background">
                        
                    </section>
                </div>
                <div className="w-1/2">
                    {/* for comments if any */}
                </div>
            </div>

            <div className="mt-8">
                <div className="w-1/2">
                    
                </div>
                <div className="w-1/2">
                    {/* for comments if any */}
                </div>
            </div>

            <NextCard className="mt-12" text={"Next: Divide and Conquer"} href={nextHref} />
        </div>
    )
}