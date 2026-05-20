import {
  LoaderCircle,
  Search,
  Plus,
  Delete,
  Save,
  CircleCheckBig,
  CircleX,
} from "lucide-react";
import { useState, useRef } from "react";
import type { Course } from "../data/courses";

// Maps header filter labels to their corresponding course tag values
const FILTER_TAG_MAP: Record<string, string | null> = {
  MAJOR: null, // null = show all
  GE: "GE",
  "UPPER DIV": "UPPER DIV",
  SUPPORT: "SUPPORT",
  "LOWER DIV": "LOWER DIV",
};

// Controls the display order of tag sections in the course list
const TAG_DISPLAY_ORDER = ["LOWER DIV", "UPPER DIV", "SUPPORT", "GE"];
const FILTER_LABELS = ["MAJOR", "GE", "LOWER DIV", "UPPER DIV", "SUPPORT"];

// ─── ClassTable (root) ────────────────────────────────────────────────────────
interface ClassTableProps {
  courses: Course[];
  completed: Course[];
  onAddCourse: (course: Course) => void;
  onSaveCourses: (completed_courses: Course[]) => Promise<void>;
}

export default function ClassTable({
  courses,
  completed,
  onAddCourse,
<<<<<<< HEAD
}: ClassTableProps) {
=======
  onSaveCourses,
}: ClassTableProps) {
  // set up filters and query states
>>>>>>> origin/main
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  async function handleSaveCourses() {
    await onSaveCourses(completed);
  }

  function handleFilterChange(label: string) {
    const tag = FILTER_TAG_MAP[label];
    // Toggle off if clicking the already-active filter
    setActiveFilter((prev) => (prev === tag ? null : tag));
  }

  const visibleCourses = courses.filter((course) => {
    const matchesTag = activeFilter === null || course.tag === activeFilter;

    // get a search query
    const q = searchQuery.toLowerCase();

    // if search is empty, show every course, else only show matching
    const matchesSearch =
      !q ||
      course.course_name?.toLowerCase().includes(q) ||
      course.course_code?.toLowerCase().includes(q);
    return matchesTag && matchesSearch;
  });

  return (
    <div className="w-full h-full flex flex-col">
      <TableHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        handleSaveCourses={handleSaveCourses}
      />
      <TableBody
        courses={visibleCourses}
        completed={completed}
        onAddCourse={onAddCourse}
      />
    </div>
  );
}

// ─── TableHeader ──────────────────────────────────────────────────────────────
interface TableHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: string | null;
  onFilterChange: (label: string) => void;
  handleSaveCourses: () => Promise<void>;
}

function TableHeader({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
<<<<<<< HEAD
=======
  handleSaveCourses,
>>>>>>> origin/main
}: TableHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "failed"
  >("idle");

  // function to call the save courses function
  // used to set the loading animation for save
  async function handleSave() {
    setSaveState("saving");
    try {
      await handleSaveCourses();
      setSaveState("saved");
    } catch {
      setSaveState("failed");
    }
    setTimeout(() => setSaveState("idle"), 2000);
  }

  // Tracks the floating hover cursor position behind filter labels
  const [hoverCursor, setHoverCursor] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const filterListRef = useRef<HTMLUListElement>(null);

  // when the search bar changes, call onSearchChange with curr value
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    onSearchChange(e.target.value);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  }

  // for hovering over the filter
  function handleFilterHover(e: React.MouseEvent<HTMLLIElement>) {
    const li = e.currentTarget;
    const list = filterListRef.current;
    if (!list) return;
    const liRect = li.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    setHoverCursor({
      left: liRect.left - listRect.left,
      width: liRect.width,
      opacity: 1,
    });
  }

  function handleFilterListLeave() {
    setHoverCursor((prev) => ({ ...prev, opacity: 0 }));
  }

  return (
    <nav className="w-full flex items-center gap-2 border border-gray-400 shadow-sm rounded-2xl">
      {/* SEARCH INPUT -- Customized for this component*/}
      <div className="space-y-2 min-w-75">
        <div className="relative">
          <input
            className="flex w-full rounded-2xl transition-colors duration-300 h-full bg-background px-3 py-3 text-sm text-black shadow-black/5 placeholder:text-gray-400 focus-visible:outline-none focus:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 peer ps-9 pe-9 -my-px -mr-px"
            placeholder="Search classes..."
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
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
        </div>
      </div>

      {/* FILTER TABS -- used to filter courses*/}
      <ul
        ref={filterListRef}
        onMouseLeave={handleFilterListLeave}
        className="relative w-full justify-between flex items-center rounded-full p-1"
      >
        <div
          className="absolute z-0 h-full rounded-full bg-black transition-all duration-200"
          style={{
            left: hoverCursor.left,
            width: hoverCursor.width,
            opacity: hoverCursor.opacity,
          }}
        />
        {/* looping over filters to apply active filters and animations  */}
        {FILTER_LABELS.map((label) => {
          const isActive =
            activeFilter !== null && activeFilter === FILTER_TAG_MAP[label];
          return (
            <li
              key={label}
              onMouseEnter={handleFilterHover}
              onClick={() => onFilterChange(label)}
              className={`relative z-10 px-3 py-1 text-xs mix-blend-difference text-white font-semibold uppercase cursor-pointer rounded-full select-none transition-colors duration-150
                ${isActive ? "underline" : ""}`}
            >
              {label}
            </li>
          );
        })}
      </ul>

      {/*SAVE BUTTON -- save current completed courses */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saveState !== "idle"}
        className={`self-stretch ml-auto -my-px -mr-px justify-end rounded-l-xl cursor-pointer transition-all duration-300 p-3 text-sm rounded-r-2xl disabled:cursor-default
          ${saveState === "saved" ? "bg-calpoly-green text-white" : saveState === "failed" ? "bg-red-600 text-white" : "bg-black text-gray-400 hover:text-white"}`}
      >
        {saveState === "saving" && (
          <LoaderCircle className="animate-spin" size={24} />
        )}
        {saveState === "saved" && <CircleCheckBig size={24} />}
        {saveState === "failed" && <CircleX size={24} />}
        {saveState === "idle" && <Save size={24} />}
      </button>
    </nav>
  );
}

// ─── TableBody ────────────────────────────────────────────────────────────────
interface TableBodyProps {
  courses: Course[];
  completed: Course[];
  onAddCourse: (course: Course) => void;
}

function TableBody({ courses, completed, onAddCourse }: TableBodyProps) {
  // init an array that groups courses by tag in the defined display order
  const groups = TAG_DISPLAY_ORDER.reduce<{ tag: string; courses: Course[] }[]>(
    (acc, tag) => {
      const matching = courses.filter((c) => c.tag === tag);
      if (matching.length > 0) acc.push({ tag, courses: matching });
      return acc;
    },
    [],
  );

  {
    /* EDGE CASE */
  }
  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center w-full flex-1 min-h-0 mt-2 border rounded-xl border-gray-200 text-gray-400 text-sm">
        No courses found
      </div>
    );
  }

  return (
    <div className="w-full flex-1 min-h-0 mt-2 border rounded-xl border-gray-200 overflow-y-auto">
      {groups.map(({ tag, courses: tagCourses }) => (
        <div key={tag}>
          {/* Section header with divider line */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 shrink-0">
              {tag}
            </span>
            <hr className="flex-1 border-gray-200" />
          </div>
          <div className="divide-y divide-gray-100">
            {tagCourses.map((course) => (
              <CourseButton
                key={course.course_id}
                {...course}
                isSelected={completed.some(
<<<<<<< HEAD
                  (c) => c.courseNumber === course.courseNumber,
=======
                  (c) => c.course_id === course.course_id,
>>>>>>> origin/main
                )}
                onClick={() => onAddCourse(course)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CourseButton ─────────────────────────────────────────────────────────────

interface CourseButtonProps extends Course {
  onClick: () => void;
  isSelected: boolean;
}

// Used in both the course list (class-table) and the completed sidebar (completed-table)
export function CourseButton({
<<<<<<< HEAD
  courseNumber,
  courseTitle,
=======
  course_code,
  course_name,
>>>>>>> origin/main
  onClick,
  isSelected,
}: CourseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors duration-150 cursor-pointer
        ${isSelected ? "hover:bg-red-50" : "hover:bg-gray-50"}`}
    >
      <span
        className={`w-20 shrink-0 text-sm font-mono font-semibold ${isSelected ? "text-black" : "text-gray-700"}`}
      >
<<<<<<< HEAD
        {courseNumber}
=======
        {course_code}
>>>>>>> origin/main
      </span>
      <span
        className={`flex-1 text-sm ${isSelected ? "text-black font-medium" : "text-gray-500"}`}
      >
<<<<<<< HEAD
        {courseTitle}
=======
        {course_name}
>>>>>>> origin/main
      </span>
      <span
        className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full border transition-colors duration-150
        ${isSelected ? "border-red-300 text-red-400" : "border-gray-300 text-gray-400"}`}
      >
        {isSelected ? <Delete size={12} /> : <Plus size={12} />}
      </span>
    </button>
  );
}
