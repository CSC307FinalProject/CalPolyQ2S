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

router.get("/conversion-popup/:course_id", async (req, res) => {
  const { course_id } = req.params;

  try {
    const conversions = await sql`
  SELECT
    cm.mapping_id,
    string_agg(
      DISTINCT concat('[', sem.subject, ' ', sem.course_number, ']'),
      '   AND   '
    ) AS semester_classes,
    string_agg(
      DISTINCT concat('[', qtr.subject, ' ', qtr.course_number, ']'),
      '   AND   '
    ) AS quarter_classes
  FROM public.course_mappings cm

  JOIN public.course_mapping_item qtr_item
    ON qtr_item.mapping_id = cm.mapping_id
    AND qtr_item.is_substitute = true

  JOIN public.courses qtr
    ON qtr.course_id = qtr_item.course_id

  JOIN public.course_mapping_item sem_item
    ON sem_item.mapping_id = cm.mapping_id
    AND sem_item.is_substitute = false

  JOIN public.courses sem
    ON sem.course_id = sem_item.course_id

  WHERE qtr_item.course_id = ${course_id}
  GROUP BY cm.mapping_id
`;

    return res.json({ conversions });
  } catch (error) {
    console.error("Conversion popup error:", error);

    return res.status(500).json({
      error: "Failed to load conversion popup.",
      details: error.message,
    });
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

    q_item.mapping_id

  FROM public.student_courses sc

  JOIN public.courses q
    ON sc.course_id = q.course_id

  LEFT JOIN public.course_mapping_item q_item
    ON q_item.course_id = q.course_id
    AND q_item.is_substitute = true

  LEFT JOIN public.course_mapping_item s_item
    ON s_item.mapping_id = q_item.mapping_id
    AND s_item.is_substitute = false

  LEFT JOIN public.courses s
    ON s.course_id = s_item.course_id

  WHERE sc.student_id = ${student_id}
`;

    const quarterCourses = await sql`
  SELECT
    course_id,
    subject || ' ' || course_number AS course_code,
    class_name AS course_name,
    units
  FROM public.courses
  WHERE catalog_id = 1
`;

    const semesterCourses = await sql`
  SELECT
    course_id,
    subject || ' ' || course_number AS course_code,
    class_name AS course_name,
    units
  FROM public.courses
  WHERE catalog_id = 2
`;

    return res.json({ courses, quarterCourses, semesterCourses });
  } catch (error) {
    console.error("Get comparison courses error:", error);

    return res.status(500).json({
      error: "Failed to load comparison courses.",
      details: error.message,
    });
  }
});

export default router;
