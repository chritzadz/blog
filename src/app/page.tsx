import NotepadUI from "@/components/NotepadUI";
import { File, Folder } from "lucide-react"

export default function Home() {
  return (
    <>
      <div className="flex h-screen w-full items-center justify-center flex-col bg-zinc-50 font-sans dark:bg-black">
        <div className="p-5 w-1/3">
          <h1 className="text-5xl flex justify-start">christiandumanauw</h1>
          <h1 className="text-5xl flex justify-end">blog.</h1>
        </div>
        <div>
          <NotepadUI></NotepadUI>
        </div>
      </div>

      <div className="w-full h-screen flex flex-row">
        <div className="w-1/2 flex flex-col items-center justify-center">
          <div className="flex flex-col hover:bg-white/50 items-center justify-center p-10 rounded-sm">
            <Folder size={240}></Folder>
            <p className="text-5xl justify-center" style={{ fontFamily: '"Consolas", Times, serif' }}>Blogs</p>
          </div>
        </div>
        <div className="w-1/2 flex flex-col items-center justify-center">
          <div className="flex flex-col hover:bg-white/50 items-center justify-center p-10 rounded-sm">
            <Folder size={240}></Folder>
            <p className="text-5xl justify-center" style={{ fontFamily: '"Consolas", Times, serif' }}>Projects</p>
          </div>
        </div>
      </div>
    </>
  );
}
