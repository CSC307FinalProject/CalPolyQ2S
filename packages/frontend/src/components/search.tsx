"use client";

import { Input } from "./input"

import { LoaderCircle, Mic, Search } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface SearchBarProps {
    placeholder: string
}
function SearchBar({placeholder}: SearchBarProps) {
  const id = useId();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (inputValue) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [inputValue]);

  return (
    <div className="space-y-2 min-w-75">
      <div className="relative">
        <Input
          id={id}
          className="peer pe-9 ps-9"
          placeholder={placeholder}
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-gray-400 peer-disabled:opacity-50">
          {isLoading ? (
            <LoaderCircle
              className="animate-spin"
              size={16}
              strokeWidth={2}
              role="status"
              aria-label="Loading..."
            />
          ) : (
            <Search size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </div>
        <button
          className="cursor-pointer hover:text-black absolute inset-y-0 inset-e-0 flex h-full w-9 items-center justify-center rounded-e-lg"
          aria-label="Press to speak"
          type="submit"
        >
          <Mic size={16} strokeWidth={2} aria-hidden="true" className="hover:text-black" />
        </button>
      </div>
    </div>
  );
}

export { SearchBar };
