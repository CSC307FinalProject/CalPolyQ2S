import { useEffect, useState, Fragment } from "react";
import Navbar from "../components/navbar";
import { getStoredUser } from "../components/authStorage";
import { BackButton } from "../components/navButtons";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";

type Completion =
  "Completed"
  | 'Remaining'

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
    // case "Active":
    //   return "bg-yellow-100 text-yellow-600";
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
    <div className="w-full space-y-6 mt-6">
      <h3 className="text-xl font-semibold text-slate-800 tracking-tight">
        Degree Requirements ({activeFilter})
      </h3>
      
      <div className="space-y-4">
        {requirements.map((req, index) => (
          <div key={index} className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm">
            <RequirementNodeVisualizer node={req} onCourseClick={onCourseClick} />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Recursive Visualizer Component ---
function RequirementNodeVisualizer({ node, onCourseClick }: { node: Requirement; onCourseClick: (course: Course) => void }) {
  switch (node.type) {
    case 'course':
      return (
        <button
          onClick={() => onCourseClick(node)}
          className="flex items-center justify-between w-full p-4 text-left transition-all border border-slate-200 rounded-lg bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 group"
        >
          <div>
            <span className="inline-block px-2 py-0.5 text-xs font-bold font-mono tracking-wide uppercase bg-slate-200 text-slate-700 rounded mr-2 group-hover:bg-emerald-200 group-hover:text-emerald-800 transition-colors">
              {node.code}
            </span>
            <span className="font-medium text-slate-700 group-hover:text-emerald-900">{node.title}</span>
          </div>
          <span className="text-sm font-semibold text-slate-500 bg-white border px-2 py-1 rounded-md group-hover:border-emerald-200">
            {node.units} units
          </span>
        </button>
      );

    case 'and':
      return (
        <div className="space-y-3">
          {node.requirements.map((subReq, i) => (
            <RequirementNodeVisualizer key={i} node={subReq} onCourseClick={onCourseClick} />
          ))}
        </div>
      );

    case 'or':
      return (
        <div className="p-4 border-l-4 border-amber-400 bg-amber-50/30 rounded-r-lg space-y-3">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            Choose One Option:
          </div>
          {node.requirements.map((subReq, i) => (
            <Fragment key={i}>
              <RequirementNodeVisualizer node={subReq} onCourseClick={onCourseClick} />
              {i < node.requirements.length - 1 && (
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 rounded">OR</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      );

    case 'units':
      return (
        <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50/20 rounded-r-lg space-y-3">
          <div className="text-sm font-semibold text-indigo-900 mb-2">
            Complete <span className="font-bold underline text-indigo-600">{node.units} units</span> from the following:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

// function RequirementList({ requirements: requirements, onCourseClick }: RequirementListProps) {
//   // If there's no data or it's null, render nothing
//   if (!requirements) return null;

//   // --- CASE 1: INDIVIDUAL COURSE CARD ---
//   if (requirements.type === 'course') {
//     const course = requirements;
//     return (
//       <button
//         onClick={() => onCourseClick && onCourseClick(course.id)}
//         className="flex items-center justify-between w-full p-4 mb-2 text-left transition bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-500 hover:shadow"
//       >
//         <div>
//           <span className="font-bold text-blue-600 mr-3">{course.code}</span>
//           <span className="text-gray-700 font-medium">{course.title}</span>
//         </div>
//         <div className="text-sm font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
//           {course.units} units
//         </div>
//       </button>
//     );
//   }

//   // --- CASE 2: "AND" GROUPING ---
//   if (requirements.type === 'and') {
//     return (
//       <div className="flex flex-col gap-1 w-full">
//         {requirements.requirements.map((subReq, index) => (
//           <RequirementList 
//             key={`and-${index}`} 
//             requirements={subReq} 
//             onCourseClick={onCourseClick} 
//           />
//         ))}
//       </div>
//     );
//   }

//   // --- CASE 3: "OR" GROUPING ---
//   if (requirements.type === 'or') {
//     return (
//       <div className="w-full my-3 p-4 border-l-4 border-amber-400 bg-amber-50/30 rounded-r-lg">
//         <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
//           Choose One Option Below:
//         </div>
//         <div className="flex flex-col gap-2">
//           {requirements.requirements.map((subReq, index) => (
//             <RequirementList 
//               key={`or-${index}`} 
//               requirements={subReq} 
//               onCourseClick={onCourseClick} 
//             />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   // --- CASE 4: "UNITS" GROUPING ---
//   if (requirements.type === 'units') {
//     return (
//       <div className="w-full my-3 p-4 border-l-4 border-indigo-500 bg-indigo-50/20 rounded-r-lg">
//         <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
//           Complete {requirements.units_required} units from:
//         </div>
//         <div className="flex flex-col gap-2">
//           {requirements.requirements.map((subReq, index) => (
//             <RequirementList 
//               key={`units-${index}`} 
//               requirements={subReq} 
//               onCourseClick={onCourseClick} 
//             />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return null;


//   // return (
//   //   <div className="screen">
//   //     <div className="h-100 overflow-y-auto no-scrollbar p-4">
//   //       {requirements.map((course) => (
//   //         <button
//   //           key={course.id}
//   //           type="button"
//   //           onClick={() => onCourseClick(course)}
//   //           className="w-full text-left bg-white shadow p-5 hover:bg-gray-50 transition-colors"
//   //         >
//   //           <div className="flex items-start">
//   //             <div>
//   //               <h2 className="text-black! flex">{course.code}</h2>
//   //               <span className="text-xl text-gray-500">{course.title}</span>
//   //             </div>

//   //             <div className="ml-auto flex items-center gap-2">
//   //               <span className="text-sm px-3 py-1 rounded-full flex items-end">
//   //                 {course.units} units
//   //               </span>

//   //               <span
//   //                 className={`text-sm px-3 py-1 rounded-full ml-auto ${getStatusStyles(
//   //                   "remaining",// course.status,
//   //                 )}`}
//   //               >
//   //                 remaining
//   //                 {/* {course.status} */}
//   //               </span>
//   //             </div>
//   //           </div>
//   //         </button>
//   //       ))}
//   //     </div>
//   //   </div>
//   // );
// }

export default function Comparison() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeFilter1, setActiveFilter1] = useState("All");

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
  // semesterCourses.reduce((total, course) => {
  //   if (course.status === "Completed") {
  //     return total + course.units;
  //   }
  //   return total;
  // }, 0);

  const semesterPercent = Math.min((semesterUnitsDone / 120) * 100, 100);

  const semestersLeft = Math.ceil((120 - semesterUnitsDone) / 15);

  const semestersLeftPercent = Math.min(((9 - semestersLeft) / 8) * 100, 100);

  const quarterUnitsDone = 0
  // quarterCourses.reduce((total, course) => {
  //   if (course.status === "Completed") {
  //     return total + course.units;
  //   }
  //   return total;
  // }, 0);

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
          <RequirementList
            activeFilter={activeFilter}
            requirements={quarterRequirements}
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
            <RequirementList
              activeFilter={activeFilter1}
              requirements={semesterRequirements}
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
      )}
    </div>
  );
}
