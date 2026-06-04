import Navbar from "../components/navbar";
import { SearchBar } from "../components/search";
import ClassTable from "../components/classTable";
import CompletedTable from "../components/completedTable";
import type { Course, Major, Concentrations } from "../data/courses";
import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser } from "../components/authStorage";
import { apiUrl } from "../lib/api";
import Q2SFilter from "../components/q2sFilter";

function ClassSelector() {
  const user = getStoredUser();
  const studentId = user?.student_id;
  const [completed, setCompleted] = useState<Course[]>([]);

  // all courses
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // major related queries
  const [majors, setMajors] = useState<Major[]>([]);
  const [major, setMajor] = useState<string>("");

  // for concentrations for the user
  const [concentrations, setConcentrations] = useState<Concentrations[]>([]);
  const [concentration, setConcentration] = useState<string>("");

  // for filtering based on term
  const [courseType, setCourseType] = useState<string>("Q");

  const fetchCourses = useCallback(async () => {
    if (!major) return;
    console.log("No Major Selected!");

    const selectedMajorId = majors.find(
      (m) => m.major_name === major,
    )?.major_id;

    const params = new URLSearchParams({ major: String(selectedMajorId) });

    if (concentration) {
      const selectedConcentrationId = concentrations.find(
        (m) => m.concentration_name === concentration,
      )?.concentration_id;

      params.set("concentration", String(selectedConcentrationId));
    }

    fetch(apiUrl(`/class-selector/${studentId}/courses?${params}`))
      .then((res) => {
        if (res.ok) {
          console.log("Successfully queried required classes from the db");
          return res.json();
        }
        return [];
      })
      .then((data) => setCourses(data?.majorCourses ?? []));
  }, [major, majors, concentration, concentrations, studentId]);

  // set the courses
  useEffect(() => {
    if (!studentId) return;

    // get the data from the db
    fetch(apiUrl("/class-selector"))
      .then((res) => {
        if (res.ok) {
          console.log("Successfully queried classes from db");
          return res.json();
        }
        return [];
      })
      .then((data) => {
        setAllCourses(data?.courses ?? []);
        setMajors(data?.majors ?? []);
        setConcentrations(data?.concentrations ?? []);
      })
      .catch((err) => console.log(err));
  }, [studentId]);

  // set the saved courses from the previous entry
  useEffect(() => {
    if (!studentId) return;

    fetch(apiUrl(`/class-selector/${studentId}`))
      .then((res) => {
        if (res.ok) {
          console.log("Successfully queried classes from db");
          return res.json();
        }
        return [];
      })
      .then((data) => {
        setCompleted(data?.courses ?? []);
        setMajor(data?.user?.major_name ?? "");
        setConcentration(data?.user?.concentration_name ?? "");
      })
      .catch((err) => console.log(err));
  }, [studentId]);

  useEffect(() => {
    if (major && majors.length > 0) {
      fetchCourses();
    }
  }, [major, majors, fetchCourses]);

  if (!user) return <Navigate to="/login" replace />;

  function handleMajorChange(newMajor: string) {
    setMajor(newMajor);
    setConcentration("");
  }

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

  const filteredCourses = courses.filter((course) => {
    if (courseType === "Q") return course.catalog_id === 1;
    if (courseType === "S") return course.catalog_id === 2;
    return true;
  });

  const filteredAllCourses = allCourses.filter((course) => {
    if (courseType === "Q") return course.catalog_id === 1;
    if (courseType === "S") return course.catalog_id === 2;
    return true;
  });

  // function to handle saves
  async function handleSave(completed_courses: Course[]) {
    // try to send data to route -- on failure print error
    try {
      const res = await fetch(apiUrl(`/class-selector/${studentId}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: completed_courses,
          major,
          concentration,
        }),
      });
      console.log("Saving completed courses:", completed_courses);
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    } catch (err) {
      console.log(err);
    }
  }

  // Look up the major_id for whatever major name is currently selected
  const selectedMajorId = majors.find((m) => m.major_name === major)?.major_id;

  // filter only concentrations associated with that major
  const filteredConcentrations = selectedMajorId
    ? concentrations.filter((c) => c.major_id === selectedMajorId)
    : [];

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      <Navbar />
      <main className="flex-1 min-h-0 p-5 w-full grid grid-cols-3 gap-5">
        <div className="col-span-2 flex flex-col min-h-0">
          <div className="text-left text-5xl text-black font-bold mb-10">
            Search for your catalog
          </div>
          <div className="flex items-center gap-4 mb-15">
            <SearchBar
              placeholder="Major..."
              value={major}
              options={majors.map((m) => m.major_name)}
              onChange={handleMajorChange}
            />
            <SearchBar
              placeholder="Concentration (Optional)..."
              value={concentration}
              options={filteredConcentrations.map((c) => c.concentration_name)}
              onChange={setConcentration}
              disabled={filteredConcentrations.length === 0}
            />
          </div>

          <div className="flex items-center justify-between w-full text-left text-2xl text-black font-bold">
            Major - Search for courses
            <Q2SFilter value={courseType} onChange={setCourseType} />
          </div>

          <div className="mt-4 flex-1 min-h-0 h-full">
            <ClassTable
              courses={filteredCourses}
              allCourses={filteredAllCourses}
              completed={completed}
              onAddCourse={handleAddCourse}
              onRemoveCourse={handleRemoveCourse}
              onSaveCourses={handleSave}
            />
          </div>
        </div>

        <div className="col-span-1 flex flex-col min-h-0">
          <CompletedTable
            courses={completed}
            onRemoveCourse={handleRemoveCourse}
            onSaveCourses={() => handleSave(completed)}
            onRemoveAllCourse={() => setCompleted([])}
          />
        </div>
      </main>
    </div>
  );
}

export default ClassSelector;
