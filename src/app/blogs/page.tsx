import FeatureCard from "@/components/FeatureCard";
import { File } from "lucide-react";

export default function Blogs() {
    return (
        <>
            <div className="flex h-screen w-full items-center justify-center flex-col bg-zinc-50 font-sans dark:bg-black">
                <div className="p-5 w-1/5">
                    <h1 className="text-5xl flex justify-start">blog</h1>
                    <h1 className="text-5xl flex justify-end">files.</h1>
                </div>
            </div>
            <div className="w-full h-screen flex flex-wrap dark:bg-black">
                <div className="w-1/5">
                    <FeatureCard href="/blogs/design-analysis-and-algorithm" title="Design Analysis and Algorithm" Icon={File} />
                </div>
                <div className="w-1/5">
                    <FeatureCard href="/blogs/crafting-interpreter" title="Crafting Interpreter" Icon={File} />
                </div>
            </div>
        </>
    );
}
