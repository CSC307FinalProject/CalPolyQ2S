import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import { getStoredUser } from "../components/authStorage";
import { BackButton } from "../components/navButtons";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";

type SavedCourse = {
  id: number;
  title: string;
  code: string;
  units: number;
  status: string;
};

type ConversionCourse = SavedCourse & {
  convertedCode?: string;
  convertedTitle?: string;
  convertedUnits?: number;
};

const filters = ["All", "Completed", "Active", "Remaining"];

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-600";
    case "Active":
      return "bg-yellow-100 text-yellow-600";
    case "Remaining":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

type ApiCourse = {
  course_id: number;
  course_code: string;
  course_name: string;
  units: number;
  converted_course_id: number | null;
  converted_course_code: string | null;
  converted_course_name: string | null;
  converted_units: number | null;
};

type CatalogCourse = {
  course_id: number;
  course_code: string;
  course_name: string;
  units: number;
};

type CourseListProps = {
  activeFilter: string;
  courses: ConversionCourse[];
  onCourseClick: (course: ConversionCourse) => void;
};

function CourseList({ activeFilter, courses, onCourseClick }: CourseListProps) {
  const filteredCourses = courses.filter((course) => {
    if (activeFilter === "All") return true;
    return course.status === activeFilter;
  });

  return (
    <div className="screen">
      <div className="h-100 overflow-y-auto no-scrollbar p-4">
        {filteredCourses.map((course) => (
          <button
            key={course.id}
            type="button"
            onClick={() => onCourseClick(course)}
            className="w-full text-left bg-white shadow p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start">
              <div>
                <h2 className="text-black! flex">{course.code}</h2>
                <span className="text-xl text-gray-500">{course.title}</span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm px-3 py-1 rounded-full flex items-end">
                  {course.units} units
                </span>

                <span
                  className={`text-sm px-3 py-1 rounded-full ml-auto ${getStatusStyles(
                    course.status,
                  )}`}
                >
                  {course.status}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Comparison() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeFilter1, setActiveFilter1] = useState("All");

  const [quarterCourses, setQuarterCourses] = useState<ConversionCourse[]>([]);
  const [semesterCourses, setSemesterCourses] = useState<ConversionCourse[]>(
    [],
  );
  const studentId = getStoredUser()?.student_id;

  const [selectedCourse, setSelectedCourse] = useState<ConversionCourse | null>(
    null,
  );

  useEffect(() => {
    async function loadSavedCourses() {
      if (!studentId) return;

      const response = await fetch(apiUrl(`/q2s-comparison/${studentId}`));

      const json = await response.json();

      if (!response.ok) {
        console.error(json.error || "Failed to load saved courses.");
        return;
      }

      const completedQuarterIds = new Set(
        (json.courses ?? []).map((course: ApiCourse) => course.course_id),
      );

      const completedSemesterIds = new Set(
        (json.courses ?? [])
          .map((course: ApiCourse) => course.converted_course_id)
          .filter(Boolean),
      );

      const conversionByQuarterId = new Map<number, ApiCourse>(
        (json.courses ?? []).map((course: ApiCourse) => [
          course.course_id,
          course,
        ]),
      );

      const quarterSaved = (json.quarterCourses ?? []).map(
        (course: CatalogCourse) => {
          const conversion = conversionByQuarterId.get(course.course_id);

          return {
            id: course.course_id,
            code: course.course_code,
            title: course.course_name,
            units: course.units,
            status: completedQuarterIds.has(course.course_id)
              ? "Completed"
              : "Remaining",
            convertedCode: conversion?.converted_course_code ?? undefined,
            convertedTitle: conversion?.converted_course_name ?? undefined,
            convertedUnits: conversion?.converted_units ?? undefined,
          };
        },
      );

      const semesterSaved = (json.semesterCourses ?? []).map(
        (course: CatalogCourse) => ({
          id: course.course_id,
          code: course.course_code,
          title: course.course_name,
          units: course.units,
          status: completedSemesterIds.has(course.course_id)
            ? "Completed"
            : "Remaining",
        }),
      );

      setQuarterCourses(quarterSaved);
      setSemesterCourses(semesterSaved);
    }

    loadSavedCourses();
  }, [studentId]);

  const semesterUnitsDone = semesterCourses.reduce((total, course) => {
    if (course.status === "Completed") {
      return total + course.units;
    }
    return total;
  }, 0);

  const semesterPercent = Math.min((semesterUnitsDone / 120) * 100, 100);

  const semestersLeft = Math.ceil((120 - semesterUnitsDone) / 15);

  const semestersLeftPercent = Math.min(((9 - semestersLeft) / 8) * 100, 100);

  const quarterUnitsDone = quarterCourses.reduce((total, course) => {
    if (course.status === "Completed") {
      return total + course.units;
    }
    return total;
  }, 0);

  const quarterPercent = Math.min((quarterUnitsDone / 180) * 100, 100);

  const quartersLeft = Math.ceil((180 - quarterUnitsDone) / 16);

  const quartersLeftPercent = Math.min(((12 - quartersLeft) / 12) * 100, 100);

  const Recommended = Math.min(2 * quartersLeft, 3 * semestersLeft);

  return (
    <div className="bg-white ">
      <Navbar />
      <div className="bg-white flex items-stretch">
        <div
          className="bg-white rounded-xl border border-gray-200 p-5"
          style={{ width: "50%" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-black! text-sm">Quarter Catalog (2022-2026)</h2>
            {Recommended === quartersLeft * 2 && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-0.5 rounded-full">
                Recommended
              </span>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
              Progress
            </p>

            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Units completed</span>
              <span className="font-medium text-gray-900">
                {quarterUnitsDone} / 180
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
              <div
                className="h-1.5 rounded-full bg-calpoly-green"
                style={{ width: `${quarterPercent}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Terms completed</span>
              <span className="font-medium text-gray-900">
                {quartersLeft} remaining
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-calpoly-green"
                style={{ width: `${quartersLeftPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-3xl font-semibold text-gray-900 leading-none mb-1">
                {quarterUnitsDone}
              </div>
              <div className="text-xs font-medium text-gray-800">
                Units Done
              </div>
              <div className="text-xs text-gray-400">quarter units</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-3xl font-semibold text-gray-900 leading-none mb-1">
                {quartersLeft}
              </div>
              <div className="text-xs font-medium text-gray-800">
                Terms Left
              </div>
              <div className="text-xs text-gray-400">quarters</div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Courses
            </span>
            <div className="flex gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={` cursor-pointer text-xs px-3 py-1 rounded-full border transition-colors ${
                    activeFilter === filter
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <CourseList
            activeFilter={activeFilter}
            courses={quarterCourses}
            onCourseClick={setSelectedCourse}
          />{" "}
        </div>

        <div className="w-full bg-white" style={{ width: "50%" }}>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-black! text-sm">
                Semester Catalog (2026-2030)
              </h2>
              {Recommended === semestersLeft * 3 && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
                Progress
              </p>

              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Units completed</span>
                <span className="font-medium text-gray-900">
                  {semesterUnitsDone} / 120
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                <div
                  className="h-1.5 rounded-full bg-calpoly-green"
                  style={{ width: `${semesterPercent}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Terms completed</span>
                <span className="font-medium text-gray-900">
                  {semestersLeft} remaining
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-calpoly-green"
                  style={{ width: `${semestersLeftPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-3xl font-semibold text-gray-900 leading-none mb-1">
                  {semesterUnitsDone}
                </div>
                <div className="text-xs font-medium text-gray-800">
                  Units Done
                </div>
                <div className="text-xs text-gray-400">semester units</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-3xl font-semibold text-gray-900 leading-none mb-1">
                  {semestersLeft}
                </div>
                <div className="text-xs font-medium text-gray-800">
                  Terms Left
                </div>
                <div className="text-xs text-gray-400">semesters</div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Courses
              </span>
              <div className="flex gap-1">
                <div className="flex gap-1">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter1(filter)}
                      className={`cursor-pointer text-xs px-3 py-1 rounded-full border transition-colors ${
                        activeFilter1 === filter
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <CourseList
              activeFilter={activeFilter1}
              courses={semesterCourses}
              onCourseClick={setSelectedCourse}
            />
          </div>
        </div>
      </div>
      <Link to="/class-selector" className="fixed bottom-0 left-0 m-2">
        <BackButton />
      </Link>
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Class Conversion
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedCourse.code}
                </h2>
                <p className="text-sm text-gray-500">{selectedCourse.title}</p>
              </div>

              <button
                onClick={() => setSelectedCourse(null)}
                className="rounded-full px-3 py-1 text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Quarter Course
              </p>
              <div className="mt-2 flex justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedCourse.code}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedCourse.title}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {selectedCourse.units} units
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-calpoly-green/30 bg-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
                Semester Equivalent
              </p>
              <div className="mt-2 flex justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedCourse.convertedCode || "No conversion found"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedCourse.convertedTitle ||
                      "This course may need advisor review."}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {selectedCourse.convertedUnits
                    ? `${selectedCourse.convertedUnits} units`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
