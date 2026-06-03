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
    c.catalog_id,
    c.subject || ' ' || c.course_number AS course_code,
    c.class_name AS course_name,
    c.units,
    rg.group_id,
    rg.group_name AS requirement_area,
    rg.required_count,
    rg.requirement_type,
    rgc.option_group
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
    c.catalog_id,
    c.subject || ' ' || c.course_number AS course_code,
    c.class_name AS course_name,
    c.units,
    rg.group_id,
    rg.group_name AS requirement_area,
    rg.required_count,
    rg.requirement_type,
    rgc.option_group
  FROM public.courses c
  LEFT JOIN public.requirement_group_courses rgc
    ON rgc.course_id = c.course_id
  LEFT JOIN public.requirement_groups rg
    ON rg.group_id = rgc.group_id
  WHERE c.catalog_id = 2
`;

const completedRequirements = await sql`
  SELECT DISTINCT
    rg.group_id,
    rg.catalog_id
  FROM public.student_courses sc
  JOIN public.requirement_group_courses rgc
    ON rgc.course_id = sc.course_id
  JOIN public.requirement_groups rg
    ON rg.group_id = rgc.group_id
  WHERE sc.student_id = ${student_id}

  UNION

  SELECT DISTINCT
    rg.group_id,
    rg.catalog_id
  FROM public.student_courses sc
  JOIN public.course_mapping_item item
    ON item.course_id = sc.course_id
  JOIN public.course_mapping_item other_item
    ON other_item.mapping_id = item.mapping_id
    AND other_item.is_substitute <> item.is_substitute
  JOIN public.requirement_group_courses rgc
    ON rgc.course_id = other_item.course_id
  JOIN public.requirement_groups rg
    ON rg.group_id = rgc.group_id
  WHERE sc.student_id = ${student_id}
`;

const requirementProgress = await sql`
  WITH completed_courses AS (
    SELECT sc.course_id
    FROM public.student_courses sc
    WHERE sc.student_id = ${student_id}
  ),

  completed_mapped_courses AS (
    SELECT DISTINCT other_item.course_id
    FROM public.student_courses sc
    JOIN public.course_mapping_item item
      ON item.course_id = sc.course_id
    JOIN public.course_mapping_item other_item
      ON other_item.mapping_id = item.mapping_id
      AND other_item.is_substitute <> item.is_substitute
    WHERE sc.student_id = ${student_id}
  ),

  completed_all AS (
    SELECT course_id FROM completed_courses
    UNION
    SELECT course_id FROM completed_mapped_courses
  ),

  group_course_progress AS (
    SELECT
      rg.group_id,
      rg.catalog_id,
      rg.group_name,
      rg.required_count,
      rg.requirement_type,
      rg.min_units,
      rg.max_units,
      rgc.option_group,
      COUNT(DISTINCT rgc.course_id) AS option_course_count,
      COUNT(DISTINCT CASE WHEN ca.course_id IS NOT NULL THEN rgc.course_id END) AS completed_course_count,
      COALESCE(SUM(DISTINCT CASE WHEN ca.course_id IS NOT NULL THEN c.units END), 0) AS completed_units
    FROM public.requirement_groups rg
    JOIN public.requirement_group_courses rgc
      ON rgc.group_id = rg.group_id
    JOIN public.courses c
      ON c.course_id = rgc.course_id
    LEFT JOIN completed_all ca
      ON ca.course_id = rgc.course_id
    GROUP BY
      rg.group_id,
      rg.catalog_id,
      rg.group_name,
      rg.required_count,
      rg.requirement_type,
      rg.min_units,
      rg.max_units,
      rgc.option_group
  )

  SELECT
    group_id,
    catalog_id,
    group_name,
    required_count,
    requirement_type,
    min_units,
    max_units,
    SUM(completed_course_count) AS completed_count,

CASE
  WHEN requirement_type = 'all_courses'
    THEN SUM(option_course_count)
  WHEN requirement_type = 'choose_options'
    THEN MIN(option_course_count)
  ELSE required_count
END AS required_courses,

BOOL_OR(
  CASE
    WHEN requirement_type = 'all_courses'
      THEN completed_course_count >= option_course_count

    WHEN requirement_type = 'choose_courses'
      THEN completed_course_count >= required_count

    ELSE completed_course_count >= required_count
  END
) AS completed
  FROM group_course_progress
  GROUP BY
    group_id,
    catalog_id,
    group_name,
    required_count,
    requirement_type,
    min_units,
    max_units
`;

return res.json({
  courses,
  quarterCourses,
  semesterCourses,
  requirementProgress,
});  } catch (error) {
    console.error("Get comparison courses error:", error);

    return res.status(500).json({
      error: "Failed to load comparison courses.",
      details: error.message,
    });
  }
});

export default router;
