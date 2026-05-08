import { CourseButton } from "./class-table";
import type { Course } from "../data/courses";
import {ContinueButton, BackButton} from "./nav-buttons";
interface CompletedTableProps {
  courses: Course[];
  onRemoveCourse: (courseNumber: string) => void;
}

export default function CompletedTable({
  courses,
  onRemoveCourse,
}: CompletedTableProps) {
  return (
    <div className="w-full h-full border border-gray-200 rounded-xl p-3 flex flex-col justify-between gap-3">
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <div className="text-xl font-bold text-black border-b border-gray-200 pb-2">
          Completed Classes
        </div>

        <div className="flex flex-wrap gap-2 min-h-0 overflow-hidden content-start">
          {courses.map((course) => (
            <CourseButton
              key={course.courseNumber}
              {...course}
              isSelected={true}
              onClick={() => onRemoveCourse(course.courseNumber)}
            />
          ))}
        </div>
      </div>

      <div className="border-t flex justify-between border-gray-200 pt-3">
        <BackButton  />
        <ContinueButton label="Translate Classes" />

      </div>
    </div>
  );
}