import { X } from "lucide-react";
import type { Course } from "../data/courses";
import { ContinueButton, BackButton } from "./navButtons";
import { Link, useNavigate } from "react-router-dom";

// ─── CompletedCourseItem ──────────────────────────────────────────────────────
// Dedicated row component for the completed-courses sidebar.
// Visually distinct from ClassTable's CourseButton: compact, left-accented green border.
// The course-enter keyframe (defined in index.css) fires on mount for a smooth entry.

interface CompletedCourseItemProps {
  course: Course;
  onRemove: (course_id: number) => void;
}

function CompletedCourseItem({ course, onRemove }: CompletedCourseItemProps) {
  return (
    // "group" enables child group-hover selectors (X button color change)
    // Entire row is clickable and turns red on hover to signal removal
    <div
      className="group flex items-center gap-3 px-3 py-2 border-l-2 
                 hover:bg-red-50 transition-colors duration-150 cursor-pointer
                 animate-[course-enter_200ms_ease-out_both]"
      onClick={() => onRemove(course.course_id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onRemove(course.course_id)}
      aria-label={`Remove ${course.course_code}`}
    >
      {/* Emerald course code — distinct from ClassTable's gray/black palette */}
      <span className="w-16 shrink-0 text-xs font-mono font-bold text-emerald-700">
        {course.course_code}
      </span>

      <span className="flex-1 text-xs text-gray-500 truncate">
        {course.course_name}
      </span>

      {/* X button: always visible; stopPropagation prevents double-remove with row onClick */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(course.course_id);
        }}
        aria-label={`Remove ${course.course_code}`}
        className="shrink-0 p-0.5 rounded text-gray-300 group-hover:text-red-400
                   transition-colors duration-150 cursor-pointer"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ─── CompletedTable ───────────────────────────────────────────────────────────

interface CompletedTableProps {
  courses: Course[];
  onRemoveCourse: (course_id: number) => void;
  onSaveCourses: () => Promise<void>;
}

export default function CompletedTable({
  courses,
  onRemoveCourse,
  onSaveCourses,
}: CompletedTableProps) {
  const navigate = useNavigate();

  async function handleContinue() {
    await onSaveCourses();
    navigate("/q2s-comparison");
  }

  return (
    <div className="w-full h-full border border-gray-200 rounded-xl p-3 flex flex-col justify-between gap-3">
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        {/* Count badge shows how many courses are selected at a glance */}
        <div className="flex items-center justify-center text-xl font-bold text-black border-b border-gray-200 pb-2">
          Completed Classes
          {courses.length > 0 && (
            <span className="ml-2 text-base font-bold text-calpoly-green">
              [{courses.length}]
            </span>
          )}
        </div>

        {/* Scrollable vertical list — divide-y creates subtle separators between rows */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100">
          {courses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-6">
              No courses selected yet
            </p>
          ) : (
            courses.map((course) => (
              <CompletedCourseItem
                key={course.course_id}
                course={course}
                onRemove={onRemoveCourse}
              />
            ))
          )}
        </div>
      </div>

      <div className="border-t flex justify-between border-gray-200 pt-3">
        <Link to="/login">
          <BackButton />
        </Link>

        <button type="button" onClick={handleContinue}>
          <ContinueButton label="Translate Classes" />
        </button>
      </div>
    </div>
  );
}
