import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Search,
  Monitor,
  Download,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  HardDrive,
  Folder,
  ChevronRight,
  Home,
  Star,
} from "lucide-react";
import FolderFileList from "./FolderFileList";
import FileItem from "./FileItem";

const SidebarItem: React.FC<{
  icon: React.ElementType;
  label: string;
  active?: boolean;
}> = ({ icon: Icon, label, active }) => (
  <div
    className={`flex items-center gap-2 px-2 py-1.5 rounded-xs text-sm cursor-pointer ${
      active ? "bg-blue-100" : "hover:bg-gray-100 text-gray-700"
    }`}
  >
    <Icon className={`w-4 h-4 text-gray-500`} />
    <span>{label}</span>
  </div>
);

export default function FolderUI() {
	const [openDocumentFolder, setOpenDocumentFolder] = useState<boolean>(true);
	const [openBlogsFolder, setOpenBlogsFolder] = useState<boolean>(false);
	const [openProjectsFolder, setOpenProjectsFolder] = useState<boolean>(false);
	const onBlogsClick = () => {
		setOpenBlogsFolder(true);
    setOpenDocumentFolder(false);
	}

	const onProjectsClick = () => {
		setOpenProjectsFolder(true);
    setOpenDocumentFolder(false);
	}

	const onBack = () => {
		setOpenProjectsFolder(false);
		setOpenBlogsFolder(false);
    setOpenDocumentFolder(true);
	}

  return (
    <div className="flex flex-col h-full w-full bg-white text-gray-800 font-sans select-none">
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-1 text-gray-400">
          <button className="p-1 hover:bg-gray-200 rounded disabled:opacity-50" onClick={onBack}>
            <ArrowLeft size={16} />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded disabled:opacity-50">
            <ArrowRight size={16} />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded">
            <ArrowUp size={16} />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2 px-2 py-1 bg-white border border-gray-300 rounded-xs hover:border-gray-400 focus-within:border-blue-500 transition-colors">
          <Monitor size={14} className="text-gray-500" />
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-sm">This PC</span>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-sm">Documents</span>
        </div>

        <div className="w-64 flex items-center gap-2 px-2 py-1 bg-white border border-gray-300 rounded-xs hover:border-gray-400 focus-within:border-blue-500 transition-colors">
          <Search size={14} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search Documents"
            className="w-full text-sm outline-none placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 flex flex-col gap-1 p-2 border-r border-gray-200 overflow-y-auto bg-gray-50/50">
          <div className="mb-2">
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Access
            </div>
            <SidebarItem icon={Star} label="Quick access" />
            <SidebarItem icon={Monitor} label="Desktop" />
            <SidebarItem icon={Download} label="Downloads" />
            <SidebarItem icon={FileText} label="Documents" active />
            <SidebarItem icon={ImageIcon} label="Pictures" />
          </div>
          <div>
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              This PC
            </div>
            <SidebarItem icon={HardDrive} label="Local Disk (C:)" />
            <SidebarItem icon={HardDrive} label="Data (D:)" />
          </div>
        </div>

				{/* Folder Items, so it will be handled manually. not using tree structure :) */}
        <FolderFileList>
          {openDocumentFolder && !openBlogsFolder && !openProjectsFolder && (
            <>
              <FileItem
                name="Projects"
                type="folder"
                onClick={onProjectsClick}
              />
              <FileItem name="Blogs" type="folder" onClick={onBlogsClick} />
              <FileItem name="Profile.jpg" type="file" icon={ImageIcon} />
            </>
          )}
          {openBlogsFolder && (
            <>
              <FileItem name="Design and Analysis of Algorithm" href="/blogs/design-analysis-and-algorithm" type="file" icon={FileText} />
							<FileItem name="Crafting Interpreter" href="/blogs/crafting-interpreter" type="file" icon={FileText} />
            </>
          )}
          {openProjectsFolder && (
            <>
              <FileItem name="Glasc" type="file" icon={FileText} />
							<FileItem name="Permisi Website" type="file" icon={FileText} />
							<FileItem name="Filebert" type="file" icon={FileText} />
							<FileItem name="MyPort" type="file" icon={FileText} />
							<FileItem name="Whatsapp Echobot" type="file" icon={FileText} />
            </>
          )}
        </FolderFileList>
      </div>
      
      <div className="flex items-center justify-between px-3 py-1 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <span>6 items</span>
        <div className="flex gap-4">
          <span>Selected 0 items</span>
        </div>
      </div>
    </div>
  );
}
