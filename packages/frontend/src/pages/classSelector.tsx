import Navbar from "../components/navbar";
import { SearchBar } from "../components/search";
import ClassTable from "../components/classTable";
import CompletedTable from "../components/completedTable";
import type { Course } from "../data/courses";
import { Courses } from "../data/courses";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser } from "../components/authStorage";

const user = getStoredUser();

if (!user) {
  <Navigate to="/login" replace />;
}

function ClassSelector() {
  const [completed, setCompleted] = useState<Course[]>([]);

  function handleAddCourse(course: Course) {
    const isalreadyadded = completed.find(
      (c) => c.courseNumber === course.courseNumber,
    );
    if (!isalreadyadded) {
      setCompleted([...completed, course]);
    }
  }

  function handleRemoveCourse(courseNumber: string) {
    setCompleted(completed.filter((c) => c.courseNumber !== courseNumber));
  }

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      <Navbar />
      <main className="flex-1 min-h-0 p-5 w-full grid grid-cols-3">
        <div className="col-span-2 flex flex-col min-h-0">
          <div className="p-2 text-left text-5xl text-black font-bold mb-10">
            Search for your catalog
          </div>
          <div className="flex items-center gap-4 mb-20">
            <SearchBar placeholder="Major..." />
            <SearchBar placeholder="Concentration (Optional)..." />
          </div>
          <div className="w-full text-left text-2xl text-black font-bold">
            Major - Search for courses
          </div>
          <div className="mt-4 flex-1 min-h-0 h-full pb-6">
            <ClassTable
              courses={Courses}
              completed={completed}
              onAddCourse={handleAddCourse}
            />
          </div>
        </div>

        <div className="col-span-1 ml-5">
          <CompletedTable
            courses={completed}
            onRemoveCourse={handleRemoveCourse}
          />
        </div>
      </main>
    </div>
  );
}

export default ClassSelector;
