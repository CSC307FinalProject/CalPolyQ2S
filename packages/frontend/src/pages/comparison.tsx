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
  requirementArea: string;
  catalogType: "quarter" | "semester";
  groupCompleted: boolean;
  completedCount: number;
  requiredCourses: number;
};

type RequirementProgress = {
  group_id: number;
  catalog_id: number;
  completed: boolean;
  completed_count: number;
  required_courses: number;
  requirement_type: string;
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
  catalog_id: number;
  course_code: string;
  course_name: string;
  units: number;
  converted_course_id: number | null;
  converted_catalog_id: number | null;
  converted_course_code: string | null;
  converted_course_name: string | null;
  converted_units: number | null;
};

type CatalogCourse = {
  course_id: number;
  catalog_id: number;
  course_code: string;
  course_name: string;
  units: number;
  group_id: number | null;
  requirement_area: string | null;
  required_count: number | null;
  requirement_type: string | null;
  option_group: number | null;
};

type CompletedRequirement = {
  group_id: number;
  catalog_id: number;
};

type CourseListProps = {
  activeFilter: string;
  courses: ConversionCourse[];
  onCourseClick: (course: ConversionCourse) => void;
};

function groupCourses(courses: ConversionCourse[]) {
  const groups = new Map<string, ConversionCourse[]>();

  for (const course of courses) {
    const key = course.requirementArea || "Other";
    groups.set(key, [...(groups.get(key) ?? []), course]);
  }

  return Array.from(groups.entries()).map(([requirementArea, courses]) => ({
    requirementArea,
    courses,
    completed: courses.some((course) => course.groupCompleted),
    completedCount: courses[0]?.completedCount ?? 0,
    requiredCourses: courses[0]?.requiredCourses ?? 0,
  }));
}

function CourseList({ activeFilter, courses, onCourseClick }: CourseListProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const filteredCourses = courses.filter((course) => {
    if (activeFilter === "All") return true;
    return course.status === activeFilter;
  });

  const groups = groupCourses(filteredCourses);

  return (
    <div className="screen">
      <div className="h-100 overflow-y-auto no-scrollbar p-4 space-y-3">
        {groups.map((group) => {
          const isOpen = openGroups[group.requirementArea] ?? true;

          return (
            <div
              key={group.requirementArea}
              className="rounded-xl border border-gray-200 bg-white shadow"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenGroups((prev) => ({
                    ...prev,
                    [group.requirementArea]: !isOpen,
                  }))
                }
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-black">
                      {group.requirementArea}
                    </p>

                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        group.completed
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {group.completed ? "Completed" : "Remaining"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {group.completedCount} / {group.requiredCourses} courses completed
                  </p>
                </div>
              </button>

              {isOpen && (
                <div className="divide-y divide-gray-100 border-t border-gray-100">
                  {group.courses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => onCourseClick(course)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start">
                        <div>
                          <h2 className="text-black flex">{course.code}</h2>
                          <span className="text-sm text-gray-500">
                            {course.title}
                          </span>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-sm px-3 py-1 rounded-full">
                            {course.units} units
                          </span>

                          <span
                            className={`text-sm px-3 py-1 rounded-full ${getStatusStyles(
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
              )}
            </div>
          );
        })}
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

  function handleCourseClick(course: ConversionCourse) {
    setSelectedCourse(course);
  }

  useEffect(() => {
    async function loadSavedCourses() {
      if (!studentId) return;

      const response = await fetch(apiUrl(`/q2s-comparison/${studentId}`));
      const json = await response.json();

      if (!response.ok) {
        console.error(json.error || "Failed to load saved courses.");
        return;
      }

      const completedQuarterGroupIds = new Set<number>();
      const completedSemesterGroupIds = new Set<number>();

      const requirementProgressByGroupId = new Map<
        number,
        RequirementProgress
      >();

      (json.requirementProgress ?? []).forEach((req: RequirementProgress) => {
        requirementProgressByGroupId.set(req.group_id, req);
      });

      (json.requirementProgress ?? []).forEach((req: RequirementProgress) => {
        if (!req.completed) return;

        if (req.catalog_id === 1) {
          completedQuarterGroupIds.add(req.group_id);
        }

        if (req.catalog_id === 2) {
          completedSemesterGroupIds.add(req.group_id);
        }
      });

      const completedQuarterIds = new Set<number>();
      const completedSemesterIds = new Set<number>();

      (json.courses ?? []).forEach((course: ApiCourse) => {
        if (course.catalog_id === 1) {
          completedQuarterIds.add(course.course_id);
        }

        if (course.catalog_id === 2) {
          completedSemesterIds.add(course.course_id);
        }

        if (course.converted_course_id && course.converted_catalog_id === 1) {
          completedQuarterIds.add(course.converted_course_id);
        }

        if (course.converted_course_id && course.converted_catalog_id === 2) {
          completedSemesterIds.add(course.converted_course_id);
        }
      });

      const conversionByQuarterId = new Map<number, ApiCourse[]>();
      const conversionBySemesterId = new Map<number, ApiCourse[]>();

      function addConversion(
        map: Map<number, ApiCourse[]>,
        key: number,
        value: ApiCourse,
      ) {
        const existing = map.get(key) ?? [];
        existing.push(value);
        map.set(key, existing);
      }

      (json.courses ?? []).forEach((course: ApiCourse) => {
        const isQuarter = course.catalog_id === 1;
        const isSemester = course.catalog_id === 2;

        if (isQuarter) completedQuarterIds.add(course.course_id);
        if (isSemester) completedSemesterIds.add(course.course_id);

        if (course.converted_course_id && course.converted_catalog_id === 1) {
          completedQuarterIds.add(course.converted_course_id);
        }

        if (course.converted_course_id && course.converted_catalog_id === 2) {
          completedSemesterIds.add(course.converted_course_id);
        }

        if (!course.converted_course_id || !course.converted_catalog_id) return;

        const reversedCourse: ApiCourse = {
          course_id: course.converted_course_id,
          catalog_id: course.converted_catalog_id,
          course_code: course.converted_course_code ?? "",
          course_name: course.converted_course_name ?? "",
          units: course.converted_units ?? 0,
          converted_course_id: course.course_id,
          converted_catalog_id: course.catalog_id,
          converted_course_code: course.course_code,
          converted_course_name: course.course_name,
          converted_units: course.units,
        };

        if (isQuarter && course.converted_catalog_id === 2) {
          addConversion(conversionByQuarterId, course.course_id, course);
          addConversion(
            conversionBySemesterId,
            course.converted_course_id,
            reversedCourse,
          );
        }

        if (isSemester && course.converted_catalog_id === 1) {
          addConversion(conversionBySemesterId, course.course_id, course);
          addConversion(
            conversionByQuarterId,
            course.converted_course_id,
            reversedCourse,
          );
        }
      });

      const quarterSaved = (json.quarterCourses ?? []).map(
        (course: CatalogCourse) => {
          const conversions = conversionByQuarterId.get(course.course_id) ?? [];
          const progress =
            course.group_id !== null
              ? requirementProgressByGroupId.get(course.group_id)
              : undefined;

          return {
            id: course.course_id,
            code: course.course_code,
            title: course.course_name,
            units: course.units,
            status: completedQuarterIds.has(course.course_id)
              ? "Completed"
              : "Remaining",

            groupCompleted:
              course.group_id !== null &&
              completedQuarterGroupIds.has(course.group_id),
            requirementArea: course.requirement_area ?? "Other",
            catalogType: "quarter" as const,
            convertedCode: uniqueJoin(
              conversions.map((c) => c.converted_course_code),
            ),
            convertedTitle: uniqueJoin(
              conversions.map((c) => c.converted_course_name),
            ),
            convertedUnits: conversions.reduce(
              (total, c) => total + (c.converted_units ?? 0),
              0,
            ),
completedCount: progress?.completed_count ?? 0,
requiredCourses: progress?.required_courses ?? 0,
          };
        },
      );

function uniqueJoin(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean))).join(" AND ");
}

      const semesterSaved = (json.semesterCourses ?? []).map(
        (course: CatalogCourse) => {
          const conversions =
            conversionBySemesterId.get(course.course_id) ?? [];
          const progress =
            course.group_id !== null
              ? requirementProgressByGroupId.get(course.group_id)
              : undefined;

          return {
            id: course.course_id,
            code: course.course_code,
            title: course.course_name,
            units: course.units,
            status: completedSemesterIds.has(course.course_id)
              ? "Completed"
              : "Remaining",

            groupCompleted:
              course.group_id !== null &&
              completedSemesterGroupIds.has(course.group_id),
            requirementArea: course.requirement_area ?? "Other",
            catalogType: "semester" as const,
            convertedCode: uniqueJoin(
              conversions.map((c) => c.converted_course_code),
            ),
            convertedTitle: uniqueJoin(
              conversions.map((c) => c.converted_course_name),
            ),
            convertedUnits: conversions.reduce(
              (total, c) => total + (c.converted_units ?? 0),
              0,
            ),
completedCount: progress?.completed_count ?? 0,
requiredCourses: progress?.required_courses ?? 0,
          };
        },
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
            onCourseClick={handleCourseClick}
          />{" "}
        </div>

        <div className="w-full bg-white" style={{ width: "50%" }}>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-black! text-sm">
                Semester Catalog (2026-2028)
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
              onCourseClick={handleCourseClick}
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
                {selectedCourse.catalogType === "quarter"
                  ? "Quarter Course"
                  : "Semester Course"}
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
                {selectedCourse.catalogType === "quarter"
                  ? "Semester Equivalent"
                  : "Quarter Equivalent"}
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
