import NotepadUI from "@/components/NotepadUI";
import FeatureCard from "@/components/FeatureCard";
import { Folder } from "lucide-react";

export default function Home() {
  return (
    <>
      <div className="flex h-screen w-full items-center justify-center flex-col font-sans bg-primary-gray">
        <div className="p-5 w-1/3">
          <h1 className="text-5xl flex justify-start">christiandumanauw</h1>
          <h1 className="text-5xl flex justify-end">blog.</h1>
        </div>
        <div>
          <NotepadUI></NotepadUI>
        </div>
      </div>

      <div className="w-full h-screen flex flex-row dark:bg-black">
        <FeatureCard href="/blogs" title="Blogs" Icon={Folder} />
        <FeatureCard href="/projects" title="Projects" Icon={Folder} />
      </div>
    </>
  );
}
