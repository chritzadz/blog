import React from "react";

type Props = {
    id: string;
    title: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
};

export default function ArticleSection({ id, title, children, className = "" }: Props) {
    return (
        <div className="sm:w-full md:w-1/2 lg:w-1/2">
            <section id={id} className={`mb-6 ${className}`}>
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <div className="prose max-w-none">{children}</div>
            </section>
        </div>
    );
}
