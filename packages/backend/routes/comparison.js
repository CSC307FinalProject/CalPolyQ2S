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
    saved.course_id,
    saved.catalog_id,
    saved.subject || ' ' || saved.course_number AS course_code,
    saved.class_name AS course_name,
    saved.units,

    other.course_id AS converted_course_id,
    other.catalog_id AS converted_catalog_id,
    other.subject || ' ' || other.course_number AS converted_course_code,
    other.class_name AS converted_course_name,
    other.units AS converted_units,

    item.mapping_id

  FROM public.student_courses sc
  JOIN public.courses saved
    ON sc.course_id = saved.course_id
  LEFT JOIN public.course_mapping_item item
    ON item.course_id = saved.course_id
  LEFT JOIN public.course_mapping_item other_item
    ON other_item.mapping_id = item.mapping_id
    AND other_item.is_substitute <> item.is_substitute
  LEFT JOIN public.courses other
    ON other.course_id = other_item.course_id
  WHERE sc.student_id = ${student_id}
`;

const quarterCourses = await sql`
  SELECT
    c.course_id,
    c.subject || ' ' || c.course_number AS course_code,
    c.class_name AS course_name,
    c.units,
    COALESCE(rg.group_name, 'Other') AS requirement_area
  FROM public.courses c
  LEFT JOIN public.requirement_group_courses rgc
    ON rgc.course_id = c.course_id
  LEFT JOIN public.requirement_groups rg
    ON rg.group_id = rgc.group_id
  WHERE c.catalog_id = 1
`;

const semesterCourses = await sql`
  SELECT
    c.course_id,
    c.subject || ' ' || c.course_number AS course_code,
    c.class_name AS course_name,
    c.units,
    COALESCE(rg.group_name, 'Other') AS requirement_area
  FROM public.courses c
  LEFT JOIN public.requirement_group_courses rgc
    ON rgc.course_id = c.course_id
  LEFT JOIN public.requirement_groups rg
    ON rg.group_id = rgc.group_id
  WHERE c.catalog_id = 2
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
