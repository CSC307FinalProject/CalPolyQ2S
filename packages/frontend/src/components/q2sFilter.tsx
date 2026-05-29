// Maps header filter labels to their corresponding course tag values
const FILTER_TAG_MAP: Record<string, string> = {
  Quarter: "Q", //show quarter classes
  Semester: "S", // show semester classes
};

const FILTER_LABELS = ["Quarter", "Semester"];

interface Q2SFilterProps {
  value: string;
  onChange: (label: string) => void;
}

export default function Q2SFilter({ value, onChange }: Q2SFilterProps) {
  return (
    <div className="border-gray-100 rounded-full bg-gray-50 border-2 ">
      {/* FILTER TABS -- used to filter courses*/}
      <ul className="relative w-full justify-between flex items-center rounded-full p-1">
        <div className="absolute z-0 h-full rounded-full bg-black transition-all duration-200" />
        {/* looping over filters to apply active filters and animations  */}
        {FILTER_LABELS.map((label) => {
          const tag = FILTER_TAG_MAP[label];
          const isActive = value === tag;
          return (
            <li
              key={label}
              onClick={() => {
                onChange(tag);
              }}
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
