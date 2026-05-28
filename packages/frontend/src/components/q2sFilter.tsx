import { useState, useRef } from "react";
// Maps header filter labels to their corresponding course tag values
const FILTER_TAG_MAP: Record<string, string | null> = {
  Quarter: null, //show quarter classes
  Semester: "Semester", // show semester classes
};

const FILTER_LABELS = ["Quarter", "Semester"];

export default function Q2SFilter() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  function onFilterChange(label: string) {
    const tag = FILTER_TAG_MAP[label];
    // Toggle off if clicking the already-active filter
    setActiveFilter((prev) => (prev === tag ? null : tag));
  }

  const filterListRef = useRef<HTMLUListElement>(null);

  return (
    <div className="border-gray-100 rounded-full bg-gray-50 border-2 ">
      {/* FILTER TABS -- used to filter courses*/}
      <ul
        ref={filterListRef}
        className="relative w-full justify-between flex items-center rounded-full p-1"
      >
        <div className="absolute z-0 h-full rounded-full bg-black transition-all duration-200" />
        {/* looping over filters to apply active filters and animations  */}
        {FILTER_LABELS.map((label) => {
          const isActive = activeFilter === FILTER_TAG_MAP[label];
          return (
            <li
              key={label}
              onClick={() => onFilterChange(label)}
              className={`relative z-10 px-3 py-2 text-xs text-black font-semibold uppercase cursor-pointer rounded-full select-none transition-colors duration-150
                ${isActive ? "bg-calpoly-green text-white" : ""}`}
            >
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
