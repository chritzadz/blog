'use client';

import NextCard from "@/components/NextCard";
import ArticleSection from "@/components/ArticleSection";
import { usePathname } from "next/navigation";

export default function Introduction() {
    const pathname = usePathname();
    const segments = pathname ? pathname.split('/').filter(Boolean) : [];
    const base = segments.length >= 2 ? `/${segments[0]}/${segments[1]}` : '/blogs/design-analysis-and-algorithm';
    const nextHref = `${base}/greedy`;

    return (
        <div className="" style={{ fontFamily: '"Consolas", Times,   serif' }}>
            <h1 className="text-6xl font-bold">Introduction</h1>

            <div className="mt-8">
                <ArticleSection id="background" title="Background">
                    {`Welcome to my first ever blog! Today's topic is quite crucial in Computer Science, yet also,
                    people call it the most hardest part of it. If you have no idea what this article is about but
                    are just interested, welcome to read it. I will try to explain it in simple terms. Basically,
                    Design Analysis and Algorithms is about how to design an algorithm and prove its correctness for a given
                    problem. The 'problem' I am referring to is mostly computer-science related questions, but some do
                    talk about real-life ones as well.`}
                </ArticleSection>
                <div className="w-1/2">
                    {/* for comments if any */}
                </div>
            </div>

            <div className="mt-8">
                <ArticleSection id="design-principles" title="Design Principles">
                    <p className="mt-4">{`I don't claim to be an expert in design or algorithms. But through studies and personal learning,
                    I found ways to understand them via analogies and simpler wording. Since there are proofs, you may need
                    some discrete mathematics background, but I'll aim to avoid overly technical terms.`}</p>

                    <p className="mt-4">{`In this blog, I will cover three common algorithm approaches (at least those taught in school):`}</p>
                    <p className="mt-4">{`1) Greedy`}</p>
                    <p className="mt-4">{`2) Divide and Conquer`}</p>
                    <p  className="mt-4">{`3) Dynamic Programming`}</p>
                </ArticleSection>
                
                <NextCard className="mt-12" text={"Next: Greedy"} href={nextHref} />
            </div>
        </div>
    )
}