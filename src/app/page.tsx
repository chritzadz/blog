"use client"

import NotepadUI from "@/components/NotepadUI";
import { Folder, Navigation2, Notebook } from "lucide-react";
import WindowScreen from "@/components/screen/WindowScreen";
import WindowsWindow from "@/components/window/WindowsWindow";
import { useState } from "react";
import FolderUI from "@/components/FolderUI";

export default function Home() {
  /*
  DESIGN IDEA
  ----------------
  I would like to make like a desktop, hmm windows maybe.

  //to make it easy currently there is three windows
  1. notepad
  2. folder
  3. IDE
  */

  const [isNotepadOpen, setIsNotepadOpen] = useState<boolean>(true);
  const [isNotepadActive, setIsNotepadActive] = useState<boolean>(true);
  const [isFolderOpen, setIsFolderOpen] = useState<boolean>(true);
  const [isFolderActive, setIsFolderActive] = useState<boolean>(true);
  const [isIdeOpen, setIsIdeOpen] = useState<boolean>(true);
  const [isIdeActive, setIsIdeActive] = useState<boolean>(true);

    // z-index management
    const [zIndices, setZIndices] = useState({
      notepad: 3,
      folder: 2,
      ide: 1,
    });

  const bringToFront = (window: "notepad" | "folder" | "ide") => {
    const maxZ = Math.max(...Object.values(zIndices));
    setZIndices((prev) => {
      const newZ = { ...prev };
      (Object.keys(newZ) as Array<"notepad" | "folder" | "ide">).forEach((key) => {
        if (key !== window && newZ[key] > prev[window]) {
          newZ[key] -= 1;
        }
      });
      newZ[window] = maxZ;
      return {
        notepad: newZ.notepad,
        folder: newZ.folder,
        ide: newZ.ide,
      };
    });
  };

  const clickedNotepadIcon = () => {
    if (isNotepadOpen){
      setIsNotepadActive(!isNotepadActive);
        bringToFront("notepad");
    } else {
      setIsNotepadOpen(!isNotepadOpen);
        bringToFront("notepad");
    }
  };

  const clickedFolderIcon = () => {
    if (isFolderOpen){
      setIsFolderActive(!isFolderActive);
        bringToFront("folder");
    } else {
      setIsFolderOpen(!isFolderOpen);
        bringToFront("folder");
    }
  };

  const clickedIdeIcon = () => {
    if (isIdeOpen){
      setIsIdeActive(!isIdeActive);
        bringToFront("ide");
    } else {
      setIsIdeOpen(!isIdeOpen);
        bringToFront("ide");
    }
  }

  
  return (
    <WindowScreen
      clickedNotepadIcon={clickedNotepadIcon}
      notepadOpen={isNotepadOpen}
      notepadActive={isNotepadActive}
      clickedFolderIcon={clickedFolderIcon}
      folderOpen={isFolderOpen}
      folderActive={isFolderActive}
      clickedIdeIcon={clickedIdeIcon}
      ideOpen={isIdeOpen}
      ideActive={isIdeActive}
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
            zIndex={zIndices.folder}
            onClose={() => setIsFolderOpen(false)}
            onMinimize={clickedFolderIcon}
            onClick={() => bringToFront("folder")}
          >
            <FolderUI></FolderUI>
          </WindowsWindow>
          <WindowsWindow
            title="Introduction.txt"
            icon={Notebook}
            initialPosition={{ x: 500, y: 150 }}
            open={isNotepadOpen}
            active={isNotepadActive}
            zIndex={zIndices.notepad}
            onClose={() => setIsNotepadOpen(false)}
            onMinimize={clickedNotepadIcon}
            onClick={() => bringToFront("notepad")}
          >
            <NotepadUI></NotepadUI>
          </WindowsWindow>
          <WindowsWindow
            title="Visual Studio Code"
            icon={Navigation2}
            initialPosition={{ x: 500, y: 150 }}
            open={isIdeOpen}
            active={isIdeActive}
            zIndex={zIndices.ide}
            onClose={() => setIsIdeOpen(false)}
            onMinimize={clickedIdeIcon}
            onClick={() => bringToFront("ide")}
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
