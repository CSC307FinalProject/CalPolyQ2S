import express from "express";
import sql from "../index.js";

const router = express.Router();

// gets the classes from the db using an sql query
router.get("/", async (req, res) => {
  try {
    // get all the courses, and use alias for better naming conventions
    // use case when to aggregate data during sql query for table (tag)
    const [courses, majors, concentrations] = await Promise.all([
      sql`
    SELECT DISTINCT
    c.course_id,
    c.subject || ' ' || c.course_number AS "course_code",
    c.class_name AS course_name,
    c.catalog_id,
    CASE
      WHEN course_number ~ '^[3-5]' THEN 'UPPER DIV'
      WHEN subject LIKE '%GE%' THEN 'GE'
      WHEN rg.group_name LIKE '%Support%' THEN 'SUPPORT'
      ELSE 'LOWER DIV'
    END AS tag
    FROM courses c
    JOIN requirement_group_courses rgc ON c.course_id = rgc.course_id
    JOIN requirement_groups rg ON rgc.group_id = rg.group_id
    `,
      sql`
      SELECT *
      FROM majors;
    `,
      sql` 
      SELECT *
      FROM concentrations;
    `,
    ]);

    res.status(200).json({ courses, majors, concentrations });
  } catch (err) {
    console.error("class-selector error:", err);
    res.status(500).json({ error: err.message });
  }
});

// get the saved classes and user metadata from the student ID
router.get("/:student_id", async (req, res) => {
  const { student_id } = req.params;

  try {
    const [courses, users] = await Promise.all([
      sql`
        SELECT 
          courses.course_id,
          courses.subject || ' ' || courses.course_number AS course_code,
          courses.class_name AS course_name,
          courses.catalog_id,
          courses.units,
          CASE
            WHEN courses.course_number ~ '^[3-5]' THEN 'UPPER DIV'
            WHEN courses.subject LIKE 'GE%' THEN 'GE'
            WHEN courses.tech_elective_eligible THEN 'SUPPORT'
            ELSE 'LOWER DIV'
          END AS tag
        FROM student_courses
        JOIN courses
          ON student_courses.course_id = courses.course_id
        WHERE student_courses.student_id = ${student_id}
      `,

      sql`
      SELECT m.major_name, c.concentration_name
      FROM students s
      LEFT JOIN majors m ON s.major_id = m.major_id
      LEFT JOIN concentrations c ON s.concentration_id = c.concentration_id
      WHERE s.student_id = ${student_id}`,
    ]);

    return res.status(200).json({ courses, user: users[0] });
  } catch (error) {
    console.error("Get saved courses and / or user error:", error);

    return res.status(500).json({
      error: "Failed to load saved courses and / or user data.",
      details: error.message,
    });
  }
});

// use to send concentration courses to the class selector:
router.get("/:student_id/courses", async (req, res) => {
  const { student_id } = req.params;
  let { major, concentration } = req.query;

  if (!major) {
    return res.status(400).json({ error: "major is required" });
  }

  if (!concentration) {
    concentration = null;
  }

  try {
    // get all the major required courses for the user
    const majorCourses = await sql`
    SELECT DISTINCT
    c.course_id,
    c.subject || ' ' || c.course_number AS "course_code",
    c.class_name AS course_name,
    c.catalog_id,
    CASE
      WHEN course_number ~ '^[3-5]' THEN 'UPPER DIV'
      WHEN rg.group_name LIKE '%GE%' THEN 'GE'
      WHEN rg.group_name LIKE '%Support%' THEN 'SUPPORT'
      ELSE 'LOWER DIV'
    END AS tag
    FROM courses c
    JOIN requirement_group_courses rgc ON c.course_id = rgc.course_id
    JOIN requirement_groups rg ON rgc.group_id = rg.group_id
    WHERE rg.major_id = ${major}
    AND (rg.concentration_id IS NULL OR rg.concentration_id = ${concentration})
    `;
    return res.status(200).json({ majorCourses });
  } catch (error) {
    // throw an error
    return res.status(500).json({
      error: "Error in querying major specific data",
      details: error.message,
    });
  }
});

// save the data
router.post("/:student_id", async (req, res) => {
  const { student_id } = req.params;
  const { courses, major, concentration } = req.body;

  try {
    await sql`
      DELETE FROM public.student_courses
      WHERE student_id = ${student_id}
    `;

    for (const course of courses) {
      await sql`
        INSERT INTO public.student_courses
          (student_id, course_id)
        VALUES
          (${student_id}, ${course.course_id})
      `;
    }

    if (major) {
      await sql`
        UPDATE students
        SET major_id = (SELECT major_id FROM majors WHERE major_name = ${major} LIMIT 1)
        WHERE student_id = ${student_id}
      `;
    }

    if (concentration) {
      await sql`
        UPDATE students
        SET concentration_id = (SELECT concentration_id FROM concentrations WHERE concentration_name = ${concentration} LIMIT 1)
        WHERE student_id = ${student_id}
      `;
    }

    return res.status(200).json({ message: "Courses saved successfully." });
  } catch (error) {
    console.error("Save courses error:", error);

    return res.status(500).json({
      error: "Failed to save courses.",
      details: error.message,
    });
  }
});

export default router;
