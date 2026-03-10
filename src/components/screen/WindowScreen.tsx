import React, { useState } from "react";
import WindowIcon from "../windows/WindowIcon";
import { Columns2, Folder, House, NotepadText } from "lucide-react";
import WindowSearch from "../windows/WindowSearch";

type WindowScreenProps = {
  children: React.ReactNode;
  clickedNotepadIcon: () => void;
  notepadOpen: boolean;
  notepadActive: boolean;
  clickedFolderIcon: () => void;
  folderOpen: boolean;
  folderActive: boolean;
  clickedChessIcon: () => void;
  chessOpen: boolean;
  chessActive: boolean;
};

export default function WindowScreen({
  children,
  clickedNotepadIcon,
  notepadActive,
  notepadOpen,
  clickedFolderIcon,
  folderActive,
  folderOpen
}: WindowScreenProps) {
  return (
    <div className="relative w-full h-screen bg-black">
      {/* main part */}
      <div className="w-full h-full overflow-hidden">{children}</div>

    	{/* task bar */}
      <div className="z-1000 absolute bottom-0 left-0 w-full h-fit justify-center bg-gray-800 text-white flex flex-row items-center px-4 border-t border-gray-600 gap-0.5">
        <WindowIcon Icon={House}></WindowIcon>
				<WindowSearch></WindowSearch>
				<WindowIcon Icon={Columns2}></WindowIcon>
				<WindowIcon Icon={Folder} onClick={clickedFolderIcon} openState={folderOpen} activeState={folderActive}></WindowIcon>
				<WindowIcon Icon={NotepadText} onClick={clickedNotepadIcon} openState={notepadOpen} activeState={notepadActive}></WindowIcon>
      </div>
    </div>
  );
}
