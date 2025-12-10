"use client"

import NotepadUI from "@/components/NotepadUI";
import FeatureCard from "@/components/FeatureCard";
import { Folder, Notebook } from "lucide-react";
import WindowScreen from "@/components/screen/WindowScreen";
import WindowsWindow from "@/components/window/WindowsWindow";
import { FileText } from "lucide-react";
import { useState } from "react";
import App from "next/app";

export default function Home() {
  /*
  DESIGN IDEA
  ----------------
  I would like to make like a desktop, hmm windows maybe.

  //to make it easy currently there is three windows
  1. notepad
  2. folder
  */

  const [isNotepadOpen, setIsNotepadOpen] = useState<boolean>(true);
  const [isNotepadActive, setIsNotepadActive] = useState<boolean>(true);

  const clickedNotepadIcon = () => {
    if (isNotepadOpen){
      setIsNotepadActive(!isNotepadActive);
    } else {
      setIsNotepadOpen(!isNotepadOpen);
    }
  };

  
  return (
    <WindowScreen clickedNotepadIcon={clickedNotepadIcon} notepadOpen={isNotepadOpen} notepadActive={isNotepadActive}>
      <div className="relative flex h-screen w-full items-center justify-center flex-col font-sans bg-primary-gray">
        <div className="p-5 w-1/3">
          <h1 className="text-5xl flex justify-start">christiandumanauw</h1>
          <h1 className="text-5xl flex justify-end">blog.</h1>
        </div>
        <div>
          <WindowsWindow
            title="Introduction.txt"
            icon={Notebook}
            initialPosition={{ x: 200, y: 150 }}
            open={isNotepadOpen}
            active={isNotepadActive}
            onClose={() => setIsNotepadOpen(false)}
            onMinimize={clickedNotepadIcon}
          >
            <NotepadUI></NotepadUI>
          </WindowsWindow>
        </div>
      </div>

      {/* <div className="w-full h-screen flex flex-row dark:bg-black">
        <FeatureCard href="/blogs" title="Blogs" Icon={Folder} />
        <FeatureCard href="/projects" title="Projects" Icon={Folder} />
      </div> */}
    </WindowScreen>
  );
}
