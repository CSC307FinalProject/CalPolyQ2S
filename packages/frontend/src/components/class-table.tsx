import { LoaderCircle, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Course } from "../data/courses";
import { Save } from "lucide-react";

interface ClassTableProps {
  courses: Course[];
  completed: Course[];
  onAddCourse: (course: Course) => void;
}
export default function ClassTable({
  courses,
  completed,
  onAddCourse,
}: ClassTableProps) {
  return (
    <div className="w-full h-full">
      <TableHeader />
      <TableBody
        courses={courses}
        completed={completed}
        onAddCourse={onAddCourse}
      />
    </div>
  );
}

function TableHeader() {
  const filters = ["MAJOR", "GE", "MATH", "UPPER DIV", "SUPPORT"];
  const [cursorStyle, setCursorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const containerRef = useRef<HTMLUListElement>(null);

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

  function handleMouseEnter(e: React.MouseEvent<HTMLLIElement>) {
    const li = e.currentTarget;
    const container = containerRef.current;
    if (!container) return;
    const liRect = li.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setCursorStyle({
      left: liRect.left - containerRect.left,
      width: liRect.width,
      opacity: 1,
    });
  }

  function handleMouseLeave() {
    setCursorStyle((prev) => ({ ...prev, opacity: 0 }));
  }

  return (
    <nav className="w-full flex items-center gap-2 border shadow-sm rounded-2xl ">
      <div className="space-y-2 min-w-75">
        <div className="relative">
          <input
            className={`flex w-full rounded-2xl transition-colors duration-300 h-full bg-background px-3 py-3 text-sm text-black shadow-black/5 
                 placeholder:text-gray-400 focus-visible:outline-none focus:bg-gray-100 
                 disabled:cursor-not-allowed disabled:opacity-50 peer ps-9 pe-9 -my-px -mr-px`}
            placeholder="Search Classes..."
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
        </div>
      </div>
      <ul
        ref={containerRef}
        onMouseLeave={handleMouseLeave}
        className="relative w-full justify-between flex items-center rounded-full p-1"
      >
        <div
          className="absolute z-0 h-full rounded-full bg-black text-white transition-all duration-200"
          style={{
            left: cursorStyle.left,
            width: cursorStyle.width,
            opacity: cursorStyle.opacity,
          }}
        />
        {filters.map((filter) => (
          <li
            key={filter}
            onMouseEnter={handleMouseEnter}
            className="relative z-10 px-3 py-1 text-xs font-semibold uppercase cursor-pointer rounded-full select-none mix-blend-difference text-white"
          >
            {filter}
          </li>
        ))}
      </ul>
      <button
        type="submit"
        className="bg-black self-stretch ml-auto -my-px -mr-px justify-end rounded-l-xl hover:text-white cursor-pointer transition-colors duration-300 p-3 text-sm rounded-r-2xl"
      >
        <Save />
      </button>
    </nav>
  );
}

function TableBody({ courses, completed, onAddCourse }: ClassTableProps) {
  return (
    <div className="flex flex-wrap content-start p-3 w-full h-full flex-1 min-h-0 mt-2 border rounded-xl border-gray-200 overflow-hidden">
      {courses.map((course) => (
        <CourseButton
          key={course.courseNumber}
          {...course}
          isSelected={completed.some(
            (c) => c.courseNumber === course.courseNumber,
          )}
          onClick={() => onAddCourse(course)}
        />
      ))}
    </div>
  );
}

interface CourseButtonProps extends Course {
  onClick: () => void;
  isSelected: boolean;
}

export function CourseButton({
  courseNumber,
  onClick,
  isSelected,
}: CourseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`mt-2 m-1.5 px-1 py-2 border rounded-xl text-sm font-semibold p-4 cursor-pointer transition-colors duration-300
       ${isSelected ? "bg-black text-gray-200 hover:text-white hover:bg-red-500" : "bg-gray-100 border-0 hover:bg-gray-200 text-gray-600"} 
        `}
    >
      {courseNumber}
    </button>
  );
}
