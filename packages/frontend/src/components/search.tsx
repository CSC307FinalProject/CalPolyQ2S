"use client";

import { Input } from "./input";
import { Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface SearchBarProps {
  placeholder: string;
  value?: string;
  options?: string[];
  onChange?: (value: string) => void;
}

function SearchBar({ placeholder, value = "", options, onChange }: SearchBarProps) {
  const id = useId();
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options?.filter(
    (o) => o != null && o.toLowerCase().includes(inputValue.toLowerCase())
  ) ?? [];

  function commit(option: string) {
    setInputValue(option);
    setOpen(false);
    onChange?.(option);
  }

  function revert() {
    setInputValue(value);
    setOpen(false);
    onChange?.(value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!options) return;
    if (e.key === "Enter") {
      e.preventDefault();
      filtered.length > 0 ? commit(filtered[0]) : revert();
    } else if (e.key === "Escape") {
      revert();
    }
  }

  function handleBlur() {
    if (!options) return;
    if (options.includes(inputValue)) return; // already valid
    if (filtered.length === 1) {
      commit(filtered[0]); // only one match, auto-complete it
    } else {
      revert();
    }
  }

  return (
    <div className="space-y-2 min-w-75" ref={containerRef}>
      <div className="relative">
        <Input
          id={id}
          className="peer pe-9 ps-9"
          placeholder={placeholder}
          type="search"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (options) setOpen(true);
          }}
          onFocus={() => { if (options) setOpen(true); }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-gray-400 peer-disabled:opacity-50">
          <Search size={16} strokeWidth={2} aria-hidden="true" />
        </div>
        {options && open && filtered.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
            {filtered.map((option) => (
              <li
                key={option}
                className="cursor-pointer px-3 py-2 text-sm text-black hover:bg-gray-100"
                onMouseDown={() => commit(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export { SearchBar };
