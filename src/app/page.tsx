import NotepadUI from "@/components/NotepadUI";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="p-5 w-1/3">
        <h1 className="text-5xl flex justify-start">christiandumanauw</h1>
        <h1 className="text-5xl flex justify-end">blog.</h1>
      </div>
      <NotepadUI></NotepadUI>
    </div>
  );  
}
