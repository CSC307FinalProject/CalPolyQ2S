import express from "express";
import sql from "../db/index.js";

const router = express.Router();

// TODO REFACTOR THIS TO GET CLASSES NEEDED TO GRAD
// TODO AKA REQUIREMENT_GROUP_COURSES FOR THAT CATALOG AND MAJOR
router.get("/", async (req, res) => {
  try {
    // get all the courses, and use alias for better naming conventions
    // use case when to aggregate data during sql query for table (tag)
    const courses = await sql`
      
    `;
    res.status(200).json({ courses });
  } catch (err) {
    console.error("class-selector error:", err);
    res.status(500).json({ error: err.message });
  }
});

// get the completed classes from the student ID
router.get("/:student_id", async (req, res) => {
  const { student_id } = req.params;

  // send sql query
  try {
    const courses = await sql`
      SELECT 
        courses.course_id,
        courses.subject || ' ' || courses.course_number AS "course_code",
        courses.class_name AS course_name,
        units,
        CASE
          WHEN courses.course_number ~ '^[3-5]' THEN 'UPPER DIV'
          WHEN courses.subject LIKE 'GE%' THEN 'GE'
          WHEN courses.tech_elective_eligible THEN 'SUPPORT'
          ELSE 'LOWER DIV'
        END AS tag
      FROM student_courses
      JOIN courses
      ON student_courses.course_id = courses.course_id
      WHERE student_id = ${student_id}
    `;
    return res.json({ courses });
  } catch (error) {
    console.error("Get saved courses error:", error);

    // construct error json with error msg and details
    return res.status(500).json({
      error: "Failed to load saved courses.",
      details: error.message,
    });
  }
});

export default router;
