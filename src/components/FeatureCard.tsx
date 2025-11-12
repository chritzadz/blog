import React from "react";
import Link from "next/link";

type Props = {
    href: string;
    title: string;
    Icon?: React.ComponentType<{ size?: number } & React.SVGProps<SVGSVGElement>>;
    size?: number;
    className?: string;
};

export default function FeatureCard({ href, title, Icon, size = 240, className = "" }: Props) {
    return (
        <div className="w-full flex flex-col items-center justify-center">
            <Link href={href}>
                <div className={`flex flex-col hover:bg-white/50 items-center justify-center p-10 rounded-sm ${className}`}>
                    {Icon ? <Icon size={size} /> : null}
                    <p className="text-lg justify-center items-center text-center" style={{ fontFamily: '"Consolas", Times, serif' }}>{title + ".docx"}</p>
                </div>
            </Link>
        </div>
    );
}
