import { ArrowRight } from "lucide-react";
import React from "react";

type SubcontentBoxProps = {
    children?: React.ReactNode;
    className?: string;
    title: string;
};

export default function SubcontentBox({
    children,
    title,
    className = "",
}: SubcontentBoxProps) {
    return (
        <>
            <div className={"flex flex-row gap-3 " + className}>
                <ArrowRight></ArrowRight>
                <h1 className="text-lg italic">{title}</h1>
            </div>
            <div className="ml-9"> {/* Adjust the margin-left as needed */}
                {children}
            </div>
        </>
        
    );
}
