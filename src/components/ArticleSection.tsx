import React from "react";

type Props = {
    id: string;
    title: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
};

export default function ArticleSection({ id, title, children, className = "" }: Props) {
    return (
        <section id={id} className={`mb-6 ${className}`}>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <div className="prose max-w-none">{children}</div>
        </section>
    );
}
