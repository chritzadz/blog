import { File } from "lucide-react";

import FeatureCard from "@/components/FeatureCard";
import { getSeriesList } from "@/lib/blog/content";

export default function Blogs() {
  const series = getSeriesList().filter((s) => s.postCount > 0);

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center flex-col bg-zinc-50 font-sans dark:bg-black">
        <div className="p-5 w-1/5">
          <h1 className="text-5xl flex justify-start">blog</h1>
          <h1 className="text-5xl flex justify-end">files.</h1>
        </div>
      </div>
      <div className="w-full h-screen flex flex-wrap dark:bg-black">
        {series.map((s) => (
          <div key={s.slug} className="w-1/5">
            <FeatureCard href={`/blogs/${s.slug}`} title={s.title} Icon={File} />
          </div>
        ))}
      </div>
    </>
  );
}
