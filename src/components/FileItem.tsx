import React from "react";
import { Folder } from "lucide-react";
import classNames from "classnames";
import Link from "next/link";

interface FileItemProps {
  name: string;
  href?: string;
  type: "folder" | "file";
  icon?: React.ElementType;
  onClick?: () => void;
}

const FileItem: React.FC<FileItemProps> = ({
  name,
  type,
  icon: Icon,
  onClick,
  href,
}) => {
  const Content = (
    <div
      className="flex flex-col items-center p-2 hover:bg-blue-50 border border-transparent rounded cursor-pointer group w-24"
      onClick={onClick}
    >
      <div className="mb-1">
        {Icon ? (
          <Icon
            className={classNames("w-12 h-12", {
              "text-yellow-500 fill-yellow-500": type === "folder",
              "text-gray-700": type !== "folder",
            })}
          />
        ) : (
          <Folder className="w-12 h-12 text-yellow-500 fill-yellow-500" />
        )}
      </div>
      <span className="text-xs text-center text-gray-700 group-hover:text-black break-words w-full line-clamp-2">
        {name}
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{Content}</Link>;
  }

  return Content;
};

export default FileItem;
