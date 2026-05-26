import express from "express";
import sql from "../db/index.js";

const router = express.Router();

// gets the classes from the db using an sql query
router.get("/", async (req, res) => {
  try {
    // get all the courses, and use alias for better naming conventions
    // use case when to aggregate data during sql query for table (tag)
    const [courses, majors] = await Promise.all([
      sql`
      SELECT 
        course_id,
        subject || ' ' || course_number AS "course_code",
        class_name AS course_name,
        CASE
          WHEN course_number ~ '^[3-5]' THEN 'UPPER DIV'
          WHEN subject LIKE 'MATH%' THEN 'MATH'
          WHEN subject LIKE 'GE%' THEN 'GE'
          WHEN tech_elective_eligible THEN 'SUPPORT'
          ELSE 'LOWER DIV'
        END AS tag
      FROM courses
      WHERE catalog_id = 1
    `,
      sql`
      SELECT *
      FROM majors;
    `,
    ]);

    res.status(200).json({ courses, majors });
  } catch (err) {
    console.error("class-selector error:", err);
    res.status(500).json({ error: err.message });
  }
});

// get the saved classes and user metadata from the student ID
router.get("/:student_id", async (req, res) => {
  const { student_id } = req.params;

  // send sql statements in parallel to fetch user saved courses and
  // student major and concentration
  try {
    const [courses, users] = await Promise.all([
      // fetch the saved courses
      sql`
      SELECT 
        courses.course_id,
        courses.subject || ' ' || courses.course_number AS course_code,
        courses.class_name AS course_name,
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
    `,
    // fetch the major and concentration
      sql`
      SELECT m.major_name, s.concentration
      FROM students s
      LEFT JOIN majors m ON s.major_id = m.major_id
      WHERE s.student_id = ${student_id}`,
    ]);

    return res.json({ courses, user: users[0] });
  } catch (error) {
    console.error("Get saved courses and / or user error:", error);

    // return failed attempt
    return res.status(500).json({
      error: "Failed to load saved courses and / or user data.",
      details: error.message,
    });
  }
});

// save the data
router.post("/:student_id", async (req, res) => {
  const { student_id } = req.params;
  const { courses, major } = req.body;

  try {
    await sql`DELETE FROM student_courses WHERE student_id = ${student_id}`;

    if (courses.length > 0) {
      const rows = courses.map((course) => ({
        student_id,
        course_id: course.course_id,
      }));
      await sql`INSERT INTO student_courses ${sql(rows)}`;
    }

    if (major) {
      await sql`
        UPDATE students
        SET major_id = (SELECT major_id FROM majors WHERE major_name = ${major} LIMIT 1)
        WHERE student_id = ${student_id}
      `;
    }

    return res.json({ message: "Courses saved successfully." });
  } catch (error) {
    console.error("Save courses error:", error);
    return res.status(500).json({
      error: "Failed to save courses.",
      details: error.message,
    });
  }
});

export default router;
