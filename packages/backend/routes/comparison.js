import express from "express";
import sql from "../index.js";

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

  try {
    const courses = await sql`
      SELECT 
        q.course_id,
        q.subject || ' ' || q.course_number AS course_code,
        q.class_name AS course_name,
        q.units,

        s.course_id AS converted_course_id,
        s.subject || ' ' || s.course_number AS converted_course_code,
        s.class_name AS converted_course_name,
        s.units AS converted_units,

        CASE
          WHEN q.course_number ~ '^[3-5]' THEN 'UPPER DIV'
          WHEN q.subject LIKE 'GE%' THEN 'GE'
          WHEN q.tech_elective_eligible THEN 'SUPPORT'
          ELSE 'LOWER DIV'
        END AS tag

      FROM public.student_courses sc
      JOIN public.courses q
        ON sc.course_id = q.course_id

      LEFT JOIN public.course_conversions cc
        ON q.course_id = cc.quarter_course_id

      LEFT JOIN public.courses s
        ON cc.semester_course_id = s.course_id

      WHERE sc.student_id = ${student_id}
    `;

    return res.json({ courses });
  } catch (error) {
    console.error("Get comparison courses error:", error);

    return res.status(500).json({
      error: "Failed to load comparison courses.",
      details: error.message,
    });
  }
});

export default router