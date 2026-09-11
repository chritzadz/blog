import { useState } from "react";

export default function BrowserUI({
  onSearch,
  onClose
}: {
  onSearch: (query: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<string>("home");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.toLowerCase().includes("chess.com")) {
      setCurrentPage("chess");
    } else {
      setCurrentPage("home");
    }
    onSearch(trimmed);
  };

  // Top bar with search
  return (
    <div className="flex flex-col w-full h-full bg-white">
      <div className="w-full flex justify-between items-center px-8 py-4 border-b">
        <span className="text-xl font-bold">Browser</span>
        <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">×</button>
      </div>
      <form onSubmit={handleSubmit} className="w-full flex gap-2 px-8 py-4 border-b bg-gray-50">
        <input
          className="flex-1 border rounded px-3 py-2 text-lg"
          placeholder="Search or type a URL..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Go</button>
      </form>
      <div className="flex-1 w-full h-full overflow-auto">
        {currentPage === "chess" ? (
          <div className="flex flex-col items-center justify-center w-full h-full gap-2 bg-gray-100 p-8 text-center">
            <div className="text-2xl font-bold text-gray-700">chess.com</div>
            <div className="text-gray-500">
              Chess lives on this desktop now. Open <b>Chess.exe</b> from the taskbar to play.
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-8">
            <div className="mt-8 text-gray-400">Try searching for <b>chess.com</b></div>
          </div>
        )}
      </div>
    </div>
  );
}
