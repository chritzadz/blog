

import React from "react";

interface FolderFileListProps {
  children: React.ReactNode;
}

export default function FolderFileList({ children }: FolderFileListProps) {
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-white">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2">
        {children}
      </div>
    </div>
  );
}
