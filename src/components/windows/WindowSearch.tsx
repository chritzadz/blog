'use client'

import { Search } from "lucide-react";
import React, { useState } from "react";

const WindowSearch: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="flex flex-row gap-1 items-center bg-gray-600 rounded-full px-2">
			<Search size={16}></Search>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Search"
        className="grow p-1 text-white text-sm focus:outline-none"
      />
    </div>
  );
};

export default WindowSearch;