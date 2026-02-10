"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function InsightSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentQuery = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(currentQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (query) {
      router.push(`/insight?q=${encodeURIComponent(query)}&page=1`);
    } else {
      router.push("/insight?page=1");
    }
  };

  const handleSearchClear = () => {
    setSearchInput("");
    router.push("/insight?page=1");
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center gap-2 w-full sm:w-auto"
    >
      <div className="relative flex-1 sm:flex-initial sm:min-w-[300px]">
        <Search
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="인사이트 검색..."
          className="
            w-full pl-10 pr-10 py-2.5
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            border border-gray-300 dark:border-gray-600
            rounded-lg
            focus:outline-none
            focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            transition-colors duration-150
          "
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              text-gray-400 hover:text-gray-600
              dark:text-gray-500 dark:hover:text-gray-300
              transition-colors duration-150
            "
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        className="
          px-4 py-2.5
          bg-emerald-500 hover:bg-emerald-600
          dark:bg-emerald-600 dark:hover:bg-emerald-500
          text-white font-medium
          rounded-lg
          shadow-sm hover:shadow-md
          transition-all duration-300
          whitespace-nowrap
        "
      >
        검색
      </button>
    </form>
  );
}
