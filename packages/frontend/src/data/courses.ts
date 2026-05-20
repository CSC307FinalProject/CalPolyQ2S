export const Courses = [
  // CSC - Lower Division
  {
    courseTitle: "Fundamentals of Computer Science",
    courseNumber: "CSC 101",
    tag: "LOWER DIV",
  },
  { courseTitle: "Data Structures", courseNumber: "CSC 202", tag: "LOWER DIV" },
  {
    courseTitle: "Systems Programming",
    courseNumber: "CSC 225",
    tag: "LOWER DIV",
  },

  // CSC - Upper Division
  { courseTitle: "Algorithms", courseNumber: "CSC 349", tag: "UPPER DIV" },
  {
    courseTitle: "Software Engineering",
    courseNumber: "CSC 357",
    tag: "UPPER DIV",
  },
  {
    courseTitle: "Database Systems",
    courseNumber: "CSC 365",
    tag: "UPPER DIV",
  },
  {
    courseTitle: "Operating Systems",
    courseNumber: "CSC 453",
    tag: "UPPER DIV",
  },

  // MATH - Support
  { courseTitle: "Calculus I", courseNumber: "MATH 141", tag: "SUPPORT" },
  { courseTitle: "Calculus II", courseNumber: "MATH 142", tag: "SUPPORT" },
  { courseTitle: "Linear Algebra", courseNumber: "MATH 206", tag: "SUPPORT" },
  {
    courseTitle: "Discrete Mathematics",
    courseNumber: "MATH 248",
    tag: "SUPPORT",
  },

  // GE Areas
  { courseTitle: "Critical Thinking", courseNumber: "GE A1", tag: "GE" },
  { courseTitle: "English Composition", courseNumber: "GE A2", tag: "GE" },
  { courseTitle: "Oral Communication", courseNumber: "GE A3", tag: "GE" },
  { courseTitle: "Life Science", courseNumber: "GE B2", tag: "GE" },
  { courseTitle: "US History", courseNumber: "GE D2", tag: "GE" },
  { courseTitle: "Arts", courseNumber: "GE C1", tag: "GE" },
];

export interface Course {
  course_id: number;
  course_name: string;
  course_code: string;
  tag: string;
}
