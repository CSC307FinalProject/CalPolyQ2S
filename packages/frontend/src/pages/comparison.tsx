import { useState } from "react";
import Navbar from "../components/navbar";

const filters = ["All", "Completed", "Active", "Remaining"];
const quarterCourses = [
  {
    id: 1,
    title: "Introduction to Programming",
    code: "CSC 101",
    units: 3,
    status: "Remaining",
  },
  {
    id: 2,
    title: "Data Structures",
    code: "CSC 202",
    units: 4,
    status: "Active",
  },
  {
    id: 3,
    title: "Computer Architecture",
    code: "CPE 233",
    units: 4,
    status: "Completed",
  },
  {
    id: 4,
    title: "Operating Systems",
    code: "CSC 453",
    units: 4,
    status: "Completed",
  },
  { id: 5, title: "Databases", code: "CSC 365", units: 4, status: "Completed" },
  { id: 6, title: "Databases", code: "CSC 365", units: 4, status: "Completed" },
  { id: 7, title: "Databases", code: "CSC 365", units: 4, status: "Completed" },
];

const semesterCourses = [
  {
    id: 1,
    title: "Introduction to Programming",
    code: "CSC 1011",
    units: 3,
    status: "Remaining",
  },
  {
    id: 2,
    title: "Data Structures",
    code: "CSC 2022",
    units: 4,
    status: "Active",
  },
  {
    id: 3,
    title: "Computer Architecture",
    code: "CPE 2333",
    units: 4,
    status: "Completed",
  },
  {
    id: 4,
    title: "Operating Systems",
    code: "CSC 4533",
    units: 4,
    status: "Completed",
  },
  {
    id: 5,
    title: "Databases",
    code: "CSC 3654",
    units: 4,
    status: "Completed",
  },
  {
    id: 6,
    title: "Databases",
    code: "CSC 3655",
    units: 4,
    status: "Completed",
  },
];

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

function CourseListQuarter({ activeFilter }: { activeFilter: string }) {
  const filteredCourses = quarterCourses.filter((course) => {
    if (activeFilter === "All") return true;
    return course.status === activeFilter;
  });

  return (
    <div className="screen">
      <div className="h-100 overflow-y-auto no-scrollbar p-4">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white shadow p-5">
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
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseListSemester({ activeFilter }: { activeFilter: string }) {
  const filteredCourses = semesterCourses.filter((course) => {
    if (activeFilter === "All") return true;
    return course.status === activeFilter;
  });

  return (
    <div className="screen">
      <div className="h-100 overflow-y-auto no-scrollbar p-4">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white shadow p-5">
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Comparison() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeFilter1, setActiveFilter1] = useState("All");

  const semesterUnitsDone = semesterCourses.reduce((total, course) => {
    if (course.status === "Completed") {
      return total + course.units;
    }
    return total;
  }, 0);

  const semesterPercent = Math.min((semesterUnitsDone / 120) * 100, 100);

  const semestersLeft = Math.ceil((120 - semesterUnitsDone) / 15);

  const semestersLeftPercent = Math.min(((8 - semestersLeft) / 8) * 100, 100);

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
          <CourseListQuarter activeFilter={activeFilter} />
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
            <CourseListSemester activeFilter={activeFilter1} />
          </div>
        </div>
      </div>
    </div>
  );
}
