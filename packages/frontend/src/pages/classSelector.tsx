import Navbar from "../components/navbar";
import { SearchBar } from "../components/search";
import ClassTable from "../components/classTable";
import CompletedTable from "../components/completedTable";
import type { Course } from "../data/courses";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser } from "../components/authStorage";
// Import API URL from .env
const API_URL = import.meta.env.VITE_API_URL;

function ClassSelector() {
  const user = getStoredUser();
  const studentId = user?.student_id;
  const [completed, setCompleted] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // set the courses
  useEffect(() => {
    if (!studentId) return;

    // get the data from the db
    fetch(`${API_URL}/class-selector`)
      .then((res) => {
        if (res.ok) {
          console.log("Successfully queried classes from db");
          return res.json();
        }
        return [];
      })
      .then((data) => setCourses(data?.courses ?? []))
      .catch((err) => console.log(err));
  }, [studentId]);

  // set the saved courses from the previous entry
  useEffect(() => {
    if (!studentId) return;

    fetch(`${API_URL}/class-selector/${studentId}`)
      .then((res) => {
        if (res.ok) {
          console.log("Successfully queried classes from db");
          return res.json();
        }
        return [];
      })
      .then((data) => setCompleted(data?.courses ?? []))
      .catch((err) => console.log(err));
  }, [studentId]);

  if (!user) return <Navigate to="/login" replace />;

  function handleAddCourse(course: Course) {
    const isalreadyadded = completed.find(
      (c) => c.course_id === course.course_id,
    );
    if (!isalreadyadded) {
      setCompleted([...completed, course]);
    }
  }

  function handleRemoveCourse(course_id: number) {
    setCompleted(completed.filter((c) => c.course_id !== course_id));
  }

  // function to handle saves
  async function handleSave(completed_courses: Course[]) {
    // try to send data to route -- on failure print error
    try {
      const res = await fetch(`${API_URL}/class-selector/${studentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses: completed_courses }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    } catch (err) {
      console.log(err);
    }
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
              courses={courses}
              completed={completed}
              onAddCourse={handleAddCourse}
              onSaveCourses={handleSave}
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
