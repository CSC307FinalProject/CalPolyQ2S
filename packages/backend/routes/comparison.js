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
    const takenQuarterCourses = await sql`
    -- Get all the quarter courses the student has taken or has credit for from classes take on semesters
    with
      mapping_group_counts as (
        select
          item1.mapping_id,
          Count(*) as substitute_classes -- get the number of substitute classes the student has taken for each mapping group
        from
          student_courses as sc
          join course_mapping_item item1 on item1.course_id = sc.course_id
          and item1.is_substitute = true
        where
          sc.student_id = ${student_id}
        group by
          item1.mapping_id
      )
    select distinct
      c.course_id,
      (c.subject || ' ' || c.course_number) as course_code,
      c.class_name as course_name
    from
      mapping_group_counts as m_counts
      join course_mappings as m on m.mapping_id = m_counts.mapping_id
      and m.substitute_classes_needed = m_counts.substitute_classes -- if the student has taken all the classes in the mapping group, include it.
      join course_mapping_item item on item.mapping_id = m.mapping_id
      join courses as c on c.catalog_id = 1
      and c.course_id = item.course_id
      -- include all classes that have been taken, or the student has taken all the classes on other catalog needed for credit
    union
    select
    c.course_id,
      (c.subject || ' ' || c.course_number) as course_code,
      c.class_name as course_name
    from
      student_courses as sc 
      join courses as c on c.catalog_id = 1
      and c.course_id = sc.course_id
    where sc.student_id = ${student_id}
    `;
    const neededQuarterCourses = await sql;
    `
    with
  taken_quarter_courses as (
    -- Get all the quarter courses the student has taken or has credit for from classes take on semesters
    with
      mapping_group_counts as (
        select
          item1.mapping_id,
          Count(*) as substitute_classes -- get the number of substitute classes the student has taken for each mapping group
        from
          student_courses as sc
          join course_mapping_item item1 on item1.course_id = sc.course_id
          and item1.is_substitute = true
        where
          sc.student_id = ${student_id}
        group by
          item1.mapping_id
      )
    select distinct
      c.course_id
    from
      mapping_group_counts as m_counts
      join course_mappings as m on m.mapping_id = m_counts.mapping_id
      and m.substitute_classes_needed = m_counts.substitute_classes -- if the student has taken all the classes in the mapping group, include it.
      join course_mapping_item item on item.mapping_id = m.mapping_id
      join courses as c on c.catalog_id = 1
      and c.course_id = item.course_id
      -- include all classes that have been taken, or the student has taken all the classes on other catalog needed for credit
    union
    select
      c.course_id
    from
      student_courses as sc
      join courses as c on c.catalog_id = 1
      and c.course_id = sc.course_id
    where
      sc.student_id = ${student_id}
  ),
  option_group_completion as (
    --Calculate whether each option group is satisfied
    select
      groups.group_id,
      gc.option_group,
      groups.group_name,
      groups.requirement_type,
      groups.required_count,
      sum(courses.units) as units,
      case
      -- For choose_courses, taking any individual class counts as a completed choice
        when groups.requirement_type = 'choose_courses'
        and count(distinct tcs.course_id) >= 1 then 1
        when groups.requirement_type = 'min_units'
        and sum(courses.units) >= groups.min_units then 1
        -- For all_courses and choose_options, you must complete ALL classes in that specific option
        when (
          groups.requirement_type = 'all_courses'
          or groups.requirement_type = 'choose_options'
        )
        and count(distinct gc.course_id) = count(distinct tcs.course_id) then 1 -- number of required courses matches taken courses
        else 0
      end as is_option_complete
    from
      requirement_group_courses as gc
      join requirement_groups as groups on groups.group_id = gc.group_id
      left join taken_quarter_courses as tcs on tcs.course_id = gc.course_id
      left join courses on courses.course_id = tcs.course_id
    where
      groups.catalog_id = 1
    group by
      groups.group_id,
      gc.option_group,
      groups.group_name,
      groups.requirement_type,
      groups.required_count,
      groups.min_units
  ),
  group_completion as (
    -- whether a given group is completed.
    select
      ogc.group_id,
      ogc.group_name,
      ogc.units,
      case
        when (sum(ogc.is_option_complete) >= 1) then 1
        else 0
      end as completion
    from
      option_group_completion as ogc
    group by
      ogc.group_id,
      ogc.group_name,
      ogc.required_count,
      ogc.units
  ),
  uncompleted_groups as (
    select
      *
    from
      group_completion ug
    where
      ug.completion = 0
  )
  select
    ug.group_id,
    ug.group_name,
    case
      when groups.requirement_type = 'all_courses' then (
        select
          string_agg(concat(c.subject, ' ', c.course_number, ' - ', c.class_name), ' AND ')
        from
          requirement_group_courses as rgc
          join courses c on rgc.course_id = c.course_id 
        where
          rgc.group_id = ug.group_id
          and not (c.course_id = any (select * from taken_quarter_courses))
      )
      when groups.requirement_type = 'choose_courses' then (
        select
          string_agg(concat(c.subject, ' ', c.course_number, ' - ', c.class_name), ' OR ')
        from
          requirement_group_courses as rgc
          join courses c on rgc.course_id = c.course_id
        where
          rgc.group_id = ug.group_id
      )
      when groups.requirement_type = 'choose_options' then (
        select
          string_agg(option.option_text, ' OR ')
        from
          (select
            concat('(', string_agg(concat(c.subject, ' ', c.course_number, ' - ', c.class_name), ' AND '), ')') as option_text
          from
            requirement_group_courses as rgc
            join courses c on rgc.course_id = c.course_id
          where
            rgc.group_id = ug.group_id
            and not (c.course_id = any (select * from taken_quarter_courses))
          group by rgc.option_group) as option
      )
      when groups.requirement_type = 'min_units' then (
        select
          concat('Take ', cast((groups.min_units - coalesce(sum(case when tqc.course_id is not null then taken_c.units else 0 end), 0)) as varchar(10)), ' units from: ', string_agg(concat(c.subject, ' ', c.course_number, ' - ', c.class_name), ', ') )
        from
          requirement_group_courses as rgc
          left join taken_quarter_courses tqc on rgc.course_id = tqc.course_id
          left join courses taken_c on taken_c.course_id = tqc.course_id
          left join courses c on rgc.course_id = c.course_id and tqc.course_id is null
        where
          rgc.group_id = ug.group_id
      )
      else 'error: requirement type not recognized'
    end as courses_needed
  from
    uncompleted_groups ug
    join requirement_groups groups on ug.group_id = groups.group_id
  order by
    ug.group_id
    `;

    const takenSemesterCourses = await sql;
    `
    -- Get all the quarter courses the student has taken or has credit for from classes take on semesters
with
  mapping_group_counts as (
    select
      item1.mapping_id,
      Count(*) as substitute_classes -- get the number of substitute classes the student has taken for each mapping group
    from
      student_courses as sc
      join course_mapping_item item1 on item1.course_id = sc.course_id
      and item1.is_substitute = true
    where
      sc.student_id = ${student_id}
    group by
      item1.mapping_id
  )
select distinct
  c.course_id,
  (c.subject || ' ' || c.course_number) as course_code,
  c.class_name as course_name
from
  mapping_group_counts as m_counts
  join course_mappings as m on m.mapping_id = m_counts.mapping_id
  and m.substitute_classes_needed = m_counts.substitute_classes -- if the student has taken all the classes in the mapping group, include it.
  join course_mapping_item item on item.mapping_id = m.mapping_id
  join courses as c on c.catalog_id = 2
  and c.course_id = item.course_id
  -- include all classes that have been taken, or the student has taken all the classes on other catalog needed for credit
union
select
c.course_id,
  (c.subject || ' ' || c.course_number) as course_code,
  c.class_name as course_name
from
  student_courses as sc 
  join courses as c on c.catalog_id = 2
  and c.course_id = sc.course_id
where sc.student_id = ${student_id}
`;
    const neededSemesterCourses = await sql;
    `
    with
  taken_quarter_courses as (
    -- Get all the quarter courses the student has taken or has credit for from classes take on semesters
    with
      mapping_group_counts as (
        select
          item1.mapping_id,
          Count(*) as substitute_classes -- get the number of substitute classes the student has taken for each mapping group
        from
          student_courses as sc
          join course_mapping_item item1 on item1.course_id = sc.course_id
          and item1.is_substitute = true
        where
          sc.student_id = ${student_id}
        group by
          item1.mapping_id
      )
    select distinct
      c.course_id
    from
      mapping_group_counts as m_counts
      join course_mappings as m on m.mapping_id = m_counts.mapping_id
      and m.substitute_classes_needed = m_counts.substitute_classes -- if the student has taken all the classes in the mapping group, include it.
      join course_mapping_item item on item.mapping_id = m.mapping_id
      join courses as c on c.catalog_id = 2
      and c.course_id = item.course_id
      -- include all classes that have been taken, or the student has taken all the classes on other catalog needed for credit
    union
    select
      c.course_id
    from
      student_courses as sc
      join courses as c on c.catalog_id = 2
      and c.course_id = sc.course_id
    where
      sc.student_id = ${student_id}
  ),
  option_group_completion as (
    --Calculate whether each option group is satisfied
    select
      groups.group_id,
      gc.option_group,
      groups.group_name,
      groups.requirement_type,
      groups.required_count,
      sum(courses.units) as units,
      case
      -- For choose_courses, taking any individual class counts as a completed choice
        when groups.requirement_type = 'choose_courses'
        and count(distinct tcs.course_id) >= 1 then 1
        when groups.requirement_type = 'min_units'
        and sum(courses.units) >= groups.min_units then 1
        -- For all_courses and choose_options, you must complete ALL classes in that specific option
        when (
          groups.requirement_type = 'all_courses'
          or groups.requirement_type = 'choose_options'
        )
        and count(distinct gc.course_id) = count(distinct tcs.course_id) then 1 -- number of required courses matches taken courses
        else 0
      end as is_option_complete
    from
      requirement_group_courses as gc
      join requirement_groups as groups on groups.group_id = gc.group_id
      left join taken_quarter_courses as tcs on tcs.course_id = gc.course_id
      left join courses on courses.course_id = tcs.course_id
    where
      groups.catalog_id = 2
    group by
      groups.group_id,
      gc.option_group,
      groups.group_name,
      groups.requirement_type,
      groups.required_count,
      groups.min_units
  ),
  group_completion as (
    -- whether a given group is completed.
    select
      ogc.group_id,
      ogc.group_name,
      ogc.units,
      case
        when (sum(ogc.is_option_complete) >= 1) then 1
        else 0
      end as completion
    from
      option_group_completion as ogc
    group by
      ogc.group_id,
      ogc.group_name,
      ogc.required_count,
      ogc.units
  ),
  uncompleted_groups as (
    select
      *
    from
      group_completion ug
    where
      ug.completion = 0
  )
  select
    ug.group_id,
    ug.group_name,
    case
      when groups.requirement_type = 'all_courses' then (
        select
          string_agg(concat(c.subject, ' ', c.course_number, ' - ', c.class_name), ' AND ')
        from
          requirement_group_courses as rgc
          join courses c on rgc.course_id = c.course_id 
        where
          rgc.group_id = ug.group_id
          and not (c.course_id = any (select * from taken_quarter_courses))
      )
      when groups.requirement_type = 'choose_courses' then (
        select
          string_agg(concat(c.subject, ' ', c.course_number, ' - ', c.class_name), ' OR ')
        from
          requirement_group_courses as rgc
          join courses c on rgc.course_id = c.course_id
        where
          rgc.group_id = ug.group_id
      )
      when groups.requirement_type = 'choose_options' then (
        select
          string_agg(option.option_text, ' OR ')
        from
          (select
            concat('(', string_agg(concat(c.subject, ' ', c.course_number, ' - ', c.class_name), ' AND '), ')') as option_text
          from
            requirement_group_courses as rgc
            join courses c on rgc.course_id = c.course_id
          where
            rgc.group_id = ug.group_id
            and not (c.course_id = any (select * from taken_quarter_courses))
          group by rgc.option_group) as option
      )
      when groups.requirement_type = 'min_units' then (
        select
          concat('Take ', cast((groups.min_units - coalesce(sum(case when tqc.course_id is not null then taken_c.units else 0 end), 0)) as varchar(10)), ' units from: ', string_agg(concat(c.subject, ' ', c.course_number, ' - ', c.class_name), ', ') )
        from
          requirement_group_courses as rgc
          left join taken_quarter_courses tqc on rgc.course_id = tqc.course_id
          left join courses taken_c on taken_c.course_id = tqc.course_id
          left join courses c on rgc.course_id = c.course_id and tqc.course_id is null
        where
          rgc.group_id = ug.group_id
      )
      else 'error: requirement type not recognized'
    end as courses_needed
  from
    uncompleted_groups ug
    join requirement_groups groups on ug.group_id = groups.group_id
  order by
    ug.group_id
    `;
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
    });
  } catch (error) {
    console.error("Get comparison courses error:", error);

    return res.status(500).json({
      error: "Failed to load comparison courses.",
      details: error.message,
    });
  }
});

export default router;
