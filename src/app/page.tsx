"use client"

import NotepadUI from "@/components/NotepadUI";
import FeatureCard from "@/components/FeatureCard";
import { Folder, Notebook } from "lucide-react";
import WindowScreen from "@/components/screen/WindowScreen";
import WindowsWindow from "@/components/window/WindowsWindow";
import { FileText } from "lucide-react";
import { useState } from "react";
import App from "next/app";
import FolderUI from "@/components/FolderUI";

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
  const [isFolderOpen, setIsFolderOpen] = useState<boolean>(true);
  const [isFolderActive, setIsFolderActive] = useState<boolean>(true);

  const clickedNotepadIcon = () => {
    if (isNotepadOpen){
      setIsNotepadActive(!isNotepadActive);
    } else {
      setIsNotepadOpen(!isNotepadOpen);
    }
  };

  const clickedFolderIcon = () => {
    if (isFolderOpen){
      setIsFolderActive(!isFolderActive);
    } else {
      setIsFolderOpen(!isFolderOpen);
    }
  };

  
  return (
    <WindowScreen 
      clickedNotepadIcon={clickedNotepadIcon}
      notepadOpen={isNotepadOpen}
      notepadActive={isNotepadActive}
      clickedFolderIcon={clickedFolderIcon}
      folderOpen={isFolderOpen}
      folderActive={isFolderActive}
    >
      <div className="relative flex h-screen w-full items-center justify-center flex-col font-sans bg-primary-gray">
        <div className="p-5 w-1/3">
          <h1 className="text-5xl flex justify-start">christiandumanauw</h1>
          <h1 className="text-5xl flex justify-end">blog.</h1>
        </div>
        <div>
          <WindowsWindow
            title="Folder"
            icon={Folder}
            initialPosition={{ x: 400, y: 100 }}
            open={isFolderOpen}
            active={isFolderActive}
            onClose={() => setIsFolderOpen(false)}
            onMinimize={clickedFolderIcon}
          >
            <FolderUI></FolderUI>
          </WindowsWindow>
          <WindowsWindow
            title="Introduction.txt"
            icon={Notebook}
            initialPosition={{ x: 500, y: 150 }}
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
