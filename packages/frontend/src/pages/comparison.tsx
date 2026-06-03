import { useEffect, useState, Fragment } from "react";
import Navbar from "../components/navbar";
import { getStoredUser } from "../components/authStorage";
import { BackButton } from "../components/navButtons";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";
import { Filter } from "lucide-react";

type Completion =
  "Completed"
  | 'Remaining'
  | 'All'
const allPredicate : CompletionPredicate = (() => true);
const completedPredicate : CompletionPredicate = ((completion: Completion) => completion === "Completed");
const remainingPredicate : CompletionPredicate = ((completion: Completion) => completion === "Remaining");
type CompletionPredicate = (completion: Completion) => boolean;
type Filter = {
  predicate: CompletionPredicate,
  str: Completion
}
const filters : Filter[] =
[
  {
    predicate: allPredicate,
    str: "All"
  },
  {
    predicate: completedPredicate,
    str: "Completed"
  },
  {
    predicate: remainingPredicate,
    str: "Remaining"
  },
]

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
type CatalogRequirement = {
  name: string;
  completion: Completion;
  requirement: Requirement
}
type CourseMapping = {
  id: number;
  substituteCourses: Course[];
  substitutedOutCourses: Course[] 
}

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
  activeFilter: Filter;
  requirements: CatalogRequirement[];
  onCourseClick: (course: Course) => void;
};
export function RequirementList({ activeFilter, requirements, onCourseClick }: RequirementListProps) {
  return (
    <div className="w-full flex-1 min-h-0 overflow-y-auto pr-2">
      <div className="space-y-4">
        {requirements.filter((req) => activeFilter.predicate(req.completion)).map((req, index) => (
          <RequirementVisualizer key={index} root={req} onCourseClick={onCourseClick} />
        ))}
      </div>
    </div>
  );
}

function RequirementVisualizer({root, onCourseClick}: {root: CatalogRequirement; onCourseClick: (course: Course) => void}) {
  return (<div>
    {root.name}
    <CompletionTag completion = {root.completion}></CompletionTag>
    <RequirementNodeVisualizer node={root.requirement} onCourseClick={onCourseClick}></RequirementNodeVisualizer>
  </div>)

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
            <CompletionTag completion={node.completion}></CompletionTag>
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

function CompletionTag({completion}:{completion: Completion}) {
  return (
    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full tracking-wide transition-opacity group-hover:opacity-90 ${getStatusStyles(completion)}`}>
      {completion || "Remaining"}
    </span>
  )
}

export default function Comparison() {
  const [quarterActiveFilter, setQuarterActiveFilter] = useState(filters[0]); // [0] is the "All" filter
  const [semesterActiveFilter, setSemesterActiveFilter] = useState(filters[0]);

  const [quarterRequirements, setQuarterRequirements] = useState<CatalogRequirement[]>([]);
  const [semesterRequirements, setSemesterRequirements] = useState<CatalogRequirement[]>([]);
  const [courseMappings, setCourseMappings] = useState<CourseMapping[]>([]);

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
      setCourseMappings(json.courseMappings)

    }

    loadSavedCourses();
  }, [studentId]);

  const semesterUnitsDone = 0
  // const semesterPercent = Math.min((semesterUnitsDone / 120) * 100, 100);
  const semestersLeft = Math.ceil((120 - semesterUnitsDone) / 15);
  // const semestersLeftPercent = Math.min(((9 - semestersLeft) / 8) * 100, 100);
  const quarterUnitsDone = 0
  // const quarterPercent = Math.min((quarterUnitsDone / 180) * 100, 100);
  const quartersLeft = Math.ceil((180 - quarterUnitsDone) / 16);
  // const quartersLeftPercent = Math.min(((12 - quartersLeft) / 12) * 100, 100);
  // const Recommended = Math.min(2 * quartersLeft, 3 * semestersLeft);
  
  return (
    <div className="bg-white ">
      <Navbar />
      <div className="bg-white flex items-stretch">
        {/* Quarter Panel */}
        <CatalogPanel header="Quarter Catalog (2022-2026)" termType="quarter" 
        unitsCompleted={quarterUnitsDone} unitsNeeded={180} termsLeft={quartersLeft} 
        isRecommended={true} requirements={quarterRequirements} activeFilter={quarterActiveFilter}
        setActiveFilter={setQuarterActiveFilter} setSelectedCourse={setSelectedCourse}></CatalogPanel>
        {/* Semester panel */}
        <CatalogPanel header="Semester Catalog (2026-2028)" termType="semester" 
        unitsCompleted={semesterUnitsDone} unitsNeeded={120} termsLeft={semestersLeft} 
        isRecommended={true} requirements={semesterRequirements} activeFilter={semesterActiveFilter}
        setActiveFilter={setSemesterActiveFilter} setSelectedCourse={setSelectedCourse}></CatalogPanel>
      </div>
      <Link to="/class-selector" className="fixed bottom-0 left-0 m-2">
        <BackButton />
      </Link>
      {selectedCourse && (<CourseConversionPopup selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} courseMappings={courseMappings}></CourseConversionPopup>)}
    </div>
  );
}
type CatalogPanelProps = {
    header : string, 
    termType: "quarter" | "semester", 
    unitsCompleted: number, 
    unitsNeeded: number,
    termsLeft: number,
    isRecommended: boolean,
    requirements: CatalogRequirement[],
    activeFilter: Filter,
    setActiveFilter: React.Dispatch<React.SetStateAction<Filter>>,
    setSelectedCourse: React.Dispatch<React.SetStateAction<Course | null>>
  }
  function CatalogPanel({header, termType, unitsCompleted, unitsNeeded, termsLeft, isRecommended, requirements, activeFilter, setActiveFilter, setSelectedCourse} : CatalogPanelProps) {
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
                style={{ width: `${99}%` }}  // TODO: Make this work from an updated computation
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
                style={{ width: `${99}%` }} // TODO: Make this work from an updated computation
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
                  key={filter.str}
                  onClick={() => setActiveFilter(filter)}
                  className={` cursor-pointer text-xs px-3 py-1 rounded-full border transition-colors ${
                    activeFilter === filter
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {filter.str}
                </button>
              ))}
            </div>
          </div>
          <RequirementList
            activeFilter={activeFilter}
            requirements={requirements}
            onCourseClick={setSelectedCourse}
          />{" "}
        </div>
    )
  }

function getCourseMappingsFor(course: Course, courseMappings: CourseMapping[]) {
  const mappings = courseMappings.filter((mapping) => {
    return mapping.substitutedOutCourses.map((course) => course.id).includes(course.id)
  })
  return mappings
}
function MiniCourseCard({ course }: { course: Course }) {
  if (!course) return null;
  return (
    <div 
      className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col space-y-0.5 text-left shadow-sm min-w-[130px]"
    >
      <span className="text-sm font-bold text-slate-900 tracking-tight">
        {course.code}
      </span>
      <span className="text-xs text-slate-500 font-normal line-clamp-1 max-w-[160px]">
        {course.title}
      </span>
      <span className="text-[10px] font-medium text-slate-400 mt-0.5">
        {course.units} units
      </span>
    </div>
  );
}
function CourseMappingVisualization(mapping: CourseMapping) {
  console.log("Displaying: ", JSON.stringify(mapping))
  return (
  // Outer Box wrapper containing this specific mapping relation
  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between gap-4 w-full">
    
    {/* Left Stack: Substitute Courses (Incoming/New) */}
    <div className="flex-1 flex flex-col gap-2">
      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider pl-1">
        Credit in
      </span>
      <div className="flex flex-col gap-3">
        {(mapping.substituteCourses || []).map((course, idx) => (
          <Fragment key={course?.id || `sub-${idx}`}>
            {/* Render the AND badge between rows cleanly */}
            {idx > 0 && (
              <div className="flex items-center justify-center h-4">
                <span className="text-[9px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase select-none">
                  and
                </span>
              </div>
            )}
            <MiniCourseCard course={course} />
          </Fragment>
        ))}
      </div>
    </div>

    {/* Middle Axis: Directional Arrow Vector */}
    <div className="flex items-center justify-center self-center text-slate-300 font-bold text-xl pt-5 px-1 select-none">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-400 animate-pulse">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
      </svg>
    </div>

    {/* Right Stack: Substituted Out Courses (Replaced/Old) */}
    <div className="flex-1 flex flex-col gap-2">
      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider pl-1">
        Counts for
      </span>
      <div className="flex flex-col gap-3">
        {(mapping.substitutedOutCourses || []).map((course, idx) => (
          <Fragment key={course?.id || `sub-${idx}`}>
            {/* Render the AND badge between rows cleanly */}
            {idx > 0 && (
              <div className="flex items-center justify-center h-4">
                <span className="text-[9px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase select-none">
                  and
                </span>
              </div>
            )}
            <MiniCourseCard course={course} />
          </Fragment>
        ))}
      </div>
    </div>

  </div>
);
}

type CourseConversionPopupProps = {
  selectedCourse: Course;
  setSelectedCourse: React.Dispatch<React.SetStateAction<Course | null>>;
  courseMappings: CourseMapping[];
}
function CourseConversionPopup({selectedCourse, setSelectedCourse, courseMappings} : CourseConversionPopupProps) {
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
          {getCourseMappingsFor(selectedCourse, courseMappings).map((mapping: CourseMapping, index) => (
            <div key={mapping?.id || `sub-${index}`}>
              {CourseMappingVisualization(mapping)}
            </div>
          ))}
        </div>
      </div>
    )
}
