"use client"

import NotepadUI from "@/components/NotepadUI";
import { Folder, Notebook, ChessPawn, Globe } from "lucide-react";
import WindowScreen from "@/components/screen/WindowScreen";
import WindowsWindow from "@/components/window/WindowsWindow";
import { useState, useEffect } from "react";
import FolderUI from "@/components/FolderUI";
import BrowserUI from "@/components/BrowserUI";
import ChessScreen from "@/components/chess/ChessScreen";

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
  const [isChessOpen, setIsChessOpen] = useState<boolean>(true);
  const [isChessActive, setIsChessActive] = useState<boolean>(true);
  const [isChessFullscreen, setIsChessFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
    const [isBrowserActive, setIsBrowserActive] = useState(false);
  // Stacking order: front-most window id first. Clicking a window focuses it.
  const [focusOrder, setFocusOrder] = useState<string[]>(["browser", "chess", "notepad", "folder"]);
  const focusWindow = (id: string) =>
    setFocusOrder((prev) => (prev[0] === id ? prev : [id, ...prev.filter((x) => x !== id)]));
  const zOf = (id: string) => 40 + (focusOrder.length - 1 - focusOrder.indexOf(id)) * 10;
  const isFocused = (id: string) => focusOrder[0] === id;

  // Handle browser search (let BrowserUI handle ChessScreen rendering)
  const handleBrowserSearch = () => {
    // No-op or add custom logic for other URLs if needed
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Taskbar semantics: closed -> open+focus, visible -> minimize, minimized -> restore+focus.
  const toggleFromTaskbar = (open: boolean, active: boolean, setOpen: (v: boolean) => void, setActive: (v: boolean) => void, id: string) => {
    if (!open) {
      setOpen(true);
      setActive(true);
      focusWindow(id);
    } else if (active) {
      setActive(false);
    } else {
      setActive(true);
      focusWindow(id);
    }
  };

  const clickedNotepadIcon = () =>
    toggleFromTaskbar(isNotepadOpen, isNotepadActive, setIsNotepadOpen, setIsNotepadActive, "notepad");

  const clickedFolderIcon = () =>
    toggleFromTaskbar(isFolderOpen, isFolderActive, setIsFolderOpen, setIsFolderActive, "folder");

  const clickedChessIcon = () =>
    toggleFromTaskbar(isChessOpen, isChessActive, setIsChessOpen, setIsChessActive, "chess");

  const clickedBrowserIcon = () =>
    toggleFromTaskbar(isBrowserOpen, isBrowserActive, setIsBrowserOpen, setIsBrowserActive, "browser");

  
  return (
    <WindowScreen 
      clickedNotepadIcon={clickedNotepadIcon}
      notepadOpen={isNotepadOpen}
      notepadActive={isNotepadActive}
      clickedFolderIcon={clickedFolderIcon}
      folderOpen={isFolderOpen}
      folderActive={isFolderActive}
      clickedChessIcon={clickedChessIcon}
      chessOpen={isChessOpen}
      chessActive={isChessActive}
      clickedBrowserIcon={clickedBrowserIcon}
      browserOpen={isBrowserOpen}
      browserActive={isBrowserActive}
    >
      <div className="relative flex h-screen w-full items-center justify-center flex-col font-sans bg-primary-gray">
        <div className="p-5 w-1/3">
          <h1 className="text-5xl flex justify-start">christiandumanauw</h1>
          <h1 className="text-5xl flex justify-end">blog.</h1>
        </div>
        <div>
          {isMobile ? (
            <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around z-50">
              <button className="flex-1 py-3" onClick={() => {
                setIsNotepadOpen(false);
                setIsFolderOpen(false);
                setIsChessOpen(true);
                setIsChessActive(true);
                focusWindow("chess");
              }}>Chess</button>
              <button className="flex-1 py-3" onClick={() => {
                setIsNotepadOpen(true);
                setIsNotepadActive(true);
                setIsFolderOpen(false);
                setIsChessOpen(false);
                focusWindow("notepad");
              }}>Notepad</button>
              <button className="flex-1 py-3" onClick={() => {
                setIsNotepadOpen(false);
                setIsFolderOpen(true);
                setIsFolderActive(true);
                setIsChessOpen(false);
                focusWindow("folder");
              }}>Folder</button>
              <button className="flex-1 py-3" onClick={() => {
                setIsBrowserOpen(true);
                setIsBrowserActive(true);
                setIsNotepadOpen(false);
                setIsFolderOpen(false);
                setIsChessOpen(false);
                focusWindow("browser");
              }}><Globe className="inline mr-1" />Browser</button>
            </div>
          ) : null}
          <WindowsWindow
            title="Folder"
            icon={Folder}
            initialPosition={{ x: 400, y: 100 }}
            open={isFolderOpen && (!isMobile || (isMobile && isFolderOpen))}
            active={isFolderActive}
            isActive={isFocused("folder")}
            zIndex={zOf("folder")}
            onFocus={() => focusWindow("folder")}
            onClose={() => setIsFolderOpen(false)}
            onMinimize={clickedFolderIcon}
            className={isMobile ? "fixed inset-0 w-full h-full z-40" : ""}
          >
            <FolderUI></FolderUI>
          </WindowsWindow>
          <WindowsWindow
            title="Introduction.txt"
            icon={Notebook}
            initialPosition={{ x: 500, y: 150 }}
            open={isNotepadOpen && (!isMobile || (isMobile && isNotepadOpen))}
            active={isNotepadActive}
            isActive={isFocused("notepad")}
            zIndex={zOf("notepad")}
            onFocus={() => focusWindow("notepad")}
            onClose={() => setIsNotepadOpen(false)}
            onMinimize={clickedNotepadIcon}
            className={isMobile ? "fixed inset-0 w-full h-full z-40" : ""}
          >
            <NotepadUI></NotepadUI>
          </WindowsWindow>
          <WindowsWindow
            className={isMobile ? "fixed inset-0 w-full h-full z-50" : "min-w-[500px] min-h-[300px]"}
            title="Browser"
            icon={Globe}
            initialPosition={{ x: 700, y: 250 }}
            open={isBrowserOpen && (!isMobile || (isMobile && isBrowserOpen))}
            active={isBrowserActive}
            isActive={isFocused("browser")}
            zIndex={zOf("browser")}
            onFocus={() => focusWindow("browser")}
            onClose={() => setIsBrowserOpen(false)}
            onMinimize={() => setIsBrowserOpen(false)}
          >
            <BrowserUI onSearch={handleBrowserSearch} onClose={() => setIsBrowserOpen(false)} />
          </WindowsWindow>
          <WindowsWindow
            className={isMobile ? "fixed inset-0 w-full h-full z-50" : "min-w-[560px] min-h-[520px]"}
            title="Chess.exe"
            icon={ChessPawn}
            initialPosition={{ x: 160, y: 80 }}
            open={isChessOpen}
            active={isChessActive}
            isActive={isFocused("chess")}
            zIndex={zOf("chess")}
            onFocus={() => focusWindow("chess")}
            onClose={() => {
              setIsChessOpen(false);
              setIsChessFullscreen(false);
            }}
            onMinimize={clickedChessIcon}
            fullscreen={isChessFullscreen}
          >
            <ChessScreen
              onGameStarted={() => setIsChessFullscreen(true)}
              onLeaveGame={() => setIsChessFullscreen(false)}
            />
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
