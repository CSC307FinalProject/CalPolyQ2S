import { CourseButton } from "./classTable";
import type { Course } from "../data/courses";
import { ContinueButton, BackButton } from "./navButtons";
import { Link, useNavigate } from "react-router-dom";

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
        <div className="text-xl font-bold text-black border-b border-gray-200 pb-2">
          Completed Classes
        </div>

        <div className="flex flex-wrap gap-2 min-h-0 overflow-hidden content-start">
          {courses.map((course) => (
            <CourseButton
              key={course.course_id}
              {...course}
              isSelected={true}
              onClick={() => onRemoveCourse(course.course_id)}
            />
          ))}
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