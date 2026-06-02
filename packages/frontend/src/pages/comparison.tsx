import { useEffect, useState, Fragment } from "react";
import Navbar from "../components/navbar";
import { getStoredUser } from "../components/authStorage";
import { BackButton } from "../components/navButtons";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";

type Completion =
  "Completed"
  | 'Remaining'
  | 'All'

type Course = {
  type: 'course';
  id: number;
  title: string;
  code: string;
  units: number;
  completion: Completion;
}
type OrRequirement = {
  type: 'or';
  completion: Completion;
  requirements: Requirement[];
}
type AndRequirement = {
  type: 'and';
  completion: Completion;
  requirements: Requirement[];
}
type UnitRequirement = {
  type: 'units'
  completion: Completion;
  units: number;
  requirements: Requirement[];
}
type Requirement =
Course
| OrRequirement
| AndRequirement
| UnitRequirement

const filters = ["All", "Completed", "Active", "Remaining"];

const getStatusStyles = (status: Completion) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-600";
    case "Remaining":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

type RequirementListProps = {
  activeFilter: string;
  requirements: Requirement[];
  onCourseClick: (course: Course) => void;
};
export function RequirementList({ activeFilter, requirements, onCourseClick }: RequirementListProps) {
  return (
    <div className="w-full flex-1 min-h-0 overflow-y-auto pr-2">
      <div className="space-y-4">
        {requirements.map((req, index) => (
          <RequirementNodeVisualizer key={index} node={req} onCourseClick={onCourseClick} />
        ))}
      </div>
    </div>
  );
}

function RequirementNodeVisualizer({ node, onCourseClick }: { node: Requirement; onCourseClick: (course: Course) => void }) {
  switch (node.type) {
    case 'course':
      return (
        <div
          onClick={() => onCourseClick(node)}
          className="flex items-center justify-between w-full py-4 px-4 text-left transition-colors hover:bg-slate-50/80 rounded-xl cursor-pointer group"
        >
          {/* Course code and title */}
          <div className="flex flex-col space-y-1">
            <span className="text-black! flex">
              {node.code}
            </span>
            <span className="text-xl text-gray-500">
              {node.title}
            </span>
          </div>

        {/* Course units and completion */}
          <div className="flex items-center space-x-6 text-sm">
            <span className="font-normal text-slate-600">
              {node.units} units
            </span>
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full tracking-wide transition-opacity group-hover:opacity-90 ${getStatusStyles(node.completion)}`}>
              {node.completion || "Remaining"}
            </span>
          </div>
        </div>
      );

    case 'and':
      return (
        <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-sm space-y-1">
          {node.requirements.map((subReq, i) => (
            <RequirementNodeVisualizer key={i} node={subReq} onCourseClick={onCourseClick} />
          ))}
        </div>
      );

    case 'or':
      return (
        <div className="p-4 border-l-4 border-amber-400 bg-amber-50/20 rounded-r-2xl space-y-1">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 px-4">
            Choose One Option:
          </div>
          {node.requirements.map((subReq, i) => (
            <Fragment key={i}>
              <RequirementNodeVisualizer node={subReq} onCourseClick={onCourseClick} />
              {i < node.requirements.length - 1 && (
                <div className="relative flex py-1 items-center px-4">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-transparent">OR</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      );

    case 'units':
      return (
        <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50/10 rounded-r-2xl space-y-2">
          <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 px-4">
            Complete <span className="underline decoration-indigo-400 decoration-2">{node.units} units</span> from:
          </div>
          <div className="grid grid-cols-1 gap-1">
            {node.requirements.map((subReq, i) => (
              <RequirementNodeVisualizer key={i} node={subReq} onCourseClick={onCourseClick} />
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}


export default function Comparison() {
  const [quarterActiveFilter, setQuarterActiveFilter] = useState("All");
  const [semesterActiveFilter, setSemesterActiveFilter] = useState("All");

  const [quarterRequirements, setQuarterRequirements] = useState<Requirement[]>([]);
  const [semesterRequirements, setSemesterRequirements] = useState<Requirement[]>([]);

  const studentId = getStoredUser()?.student_id;

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(
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
      setQuarterRequirements(json.quarterRequirements);
      setSemesterRequirements(json.semesterRequirements);

    }

    loadSavedCourses();
  }, [studentId]);

  const semesterUnitsDone = 0

  const semesterPercent = Math.min((semesterUnitsDone / 120) * 100, 100);

  const semestersLeft = Math.ceil((120 - semesterUnitsDone) / 15);

  const semestersLeftPercent = Math.min(((9 - semestersLeft) / 8) * 100, 100);

  const quarterUnitsDone = 0

  const quarterPercent = Math.min((quarterUnitsDone / 180) * 100, 100);

  const quartersLeft = Math.ceil((180 - quarterUnitsDone) / 16);

  const quartersLeftPercent = Math.min(((12 - quartersLeft) / 12) * 100, 100);

  const Recommended = Math.min(2 * quartersLeft, 3 * semestersLeft);

  type CatalogPanelProps = {
    header : String, 
    termType: "quarter" | "semester", 
    unitsCompleted: number, 
    unitsNeeded: number,
    termsLeft: number,
    isRecommended: boolean,
    requirements: Requirement[],
    activeFilter: () => string,
    setActiveFilter: React.Dispatch<React.SetStateAction<string>>
  }
  function CatalogPanel({header, termType, unitsCompleted, unitsNeeded, termsLeft, isRecommended, requirements, activeFilter, setActiveFilter} : CatalogPanelProps) {
    return (
        <div
          className="bg-white rounded-xl border border-gray-200 p-5"
          style={{ width: "50%" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-black! text-sm">{header}</h2>
            {isRecommended && (
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
                {unitsCompleted} / {unitsNeeded}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
              <div
                className="h-1.5 rounded-full bg-calpoly-green"
                style={{ width: `${quarterPercent}%` }}  // TODO: Make this work from an updated computation
              ></div>
            </div>

            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Terms completed</span>
              <span className="font-medium text-gray-900">
                {termsLeft} remaining
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-calpoly-green"
                style={{ width: `${quartersLeftPercent}%` }} // TODO: Make this work from an updated computation
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-3xl font-semibold text-gray-900 leading-none mb-1">
                {unitsCompleted}
              </div>
              <div className="text-xs font-medium text-gray-800">
                Units Done
              </div>
              <div className="text-xs text-gray-400">{termType} units</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-3xl font-semibold text-gray-900 leading-none mb-1">
                {termsLeft}
              </div>
              <div className="text-xs font-medium text-gray-800">
                Terms Left
              </div>
              <div className="text-xs text-gray-400">{termType}s</div>
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
                    activeFilter() === filter
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <RequirementList
            activeFilter={activeFilter()}
            requirements={requirements}
            onCourseClick={setSelectedCourse}
          />{" "}
        </div>
    )
  }
  type CourseConversionPopupProps = {
    selectedCourse: Course;
  }
  function CourseConversionPopup({selectedCourse} : CourseConversionPopupProps) {
      return (
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
                TODO: Rework conversion data
                {/* <div>
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
                </p> */}
              </div>
            </div>
          </div>
        </div>
      )
  }
  return (
    <div className="bg-white ">
      <Navbar />
      <div className="bg-white flex items-stretch">
        {/* Quarter Panel */}
        <CatalogPanel header="Quarter Catalog (2022-2026)" termType="quarter" 
        unitsCompleted={quarterUnitsDone} unitsNeeded={180} termsLeft={quartersLeft} 
        isRecommended={true} requirements={quarterRequirements} activeFilter={() => quarterActiveFilter}
        setActiveFilter={setQuarterActiveFilter}></CatalogPanel>
        {/* Semester panel */}
        <CatalogPanel header="Semester Catalog (2026-2028)" termType="semester" 
        unitsCompleted={semesterUnitsDone} unitsNeeded={120} termsLeft={semestersLeft} 
        isRecommended={true} requirements={semesterRequirements} activeFilter={() => semesterActiveFilter}
        setActiveFilter={setSemesterActiveFilter}></CatalogPanel>
      </div>
      <Link to="/class-selector" className="fixed bottom-0 left-0 m-2">
        <BackButton />
      </Link>
      {selectedCourse && (<CourseConversionPopup selectedCourse={selectedCourse}></CourseConversionPopup>)}
    </div>
  );
}
