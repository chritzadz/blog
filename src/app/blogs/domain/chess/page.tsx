'use client';

import ArticleSection from "@/components/ArticleSection";

export default function ChessGame() {
    return (
        <div className="" style={{ fontFamily: 'Consolas, Times, serif' }}>
            <h1 className="text-6xl font-bold">Chess Game</h1>
            <div className="mt-8">
                <ArticleSection id="intro" title="Introduction">
                    <p className="mt-4">
                        This is a simple page for the Chess game domain. You can expand this page to include rules, strategies, or even an interactive chess board in the future.
                    </p>
                </ArticleSection>
            </div>
        </div>
    );
}
