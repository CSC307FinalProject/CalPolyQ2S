import express from "express";
import sql from "../index.js";

const router = express.Router();
const QUARTER_CATALOG_ID = 1;
const SEMESTER_CATALOG_ID = 2;

// Takes in a requirement string ("502 AND 503") and a map from course_id to course info and returns
// a recursive tree representing the requirements
function parseRequirementString(expression, catalogMap) {
  if (!expression || typeof expression !== 'string') {
    console.warn(`Invalid expression received:`, expression);
    return null; // Or return { type: 'none', requirements: [] };
  }
  // Tokenize the expression, filtering out empty spaces
  // This turns "(AND (OR 123" into ['(', 'AND', '(', 'OR', '123']
  const tokens = expression.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/);
  let index = 0;

  function parse() {
    const token = tokens[index++];

    if (token === '(') {
      const operator = tokens[index++].toLowerCase(); // 'and' or 'or'

      if (operator === 'units') {
        const unitsRequired = parseInt(tokens[index++], 10);
        if (isNaN(unitsRequired)) {
          throw new Error(`Expected a number of units after UNITS operator, found: ${tokens[index - 1]}`);
        }
        const node = { 
          type: 'units', 
          units_required: unitsRequired, 
          requirements: [] 
        };

        // Gather all choices until the closing parenthesis
        while (tokens[index] !== ')') {
          node.requirements.push(parse());
        }
        
        index++; // Consume the closing ')'
        return node;
      }
      const node = { type: operator, requirements: [] };

      // Keep recursively parsing arguments until we hit the closing parenthesis
      while (tokens[index] !== ')') {
        node.requirements.push(parse());
      }
      
      index++; // Consume the closing ')'

      // if there is just one thing in the requirements list, just return that thing
      if (node.requirements.length === 1) {
        return node.requirements[0]
      }
      return node;
    }

    // Leaf node: It's a course ID
    const courseId = parseInt(token, 10);
    if (isNaN(courseId)) {
      throw new Error(`Unexpected token in prefix expression: ${token} in ${tokens} from ${expression}`);
    }

    const match = catalogMap.get(courseId);

    return {
      type: 'course',
      id: courseId,
      title: match ? match.course_name : 'Unknown Course',
      code: match ? match.course_code : "Unknown Code",
      units: match ? match.units : "Unknown Units",
      completion: match ? match.completion : "Unknown Completion"
    };
  }

  return parse();
}

async function queryNeededClasses(student_id, catalog_id, courseMap) {
  const result = await sql `
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
      join courses as c on c.course_id = item.course_id
      -- include all classes that have been taken, or the student has taken all the classes on other catalog needed for credit
    union
    select
      c.course_id
    from
      student_courses as sc
      join courses as c on c.course_id = sc.course_id
    where
      sc.student_id = ${student_id}
  ),

  option_group_completion as (
    --Calculate whether each option group is satisfied
    select
      groups.group_id,
      groups.catalog_id,
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
    group by
      groups.group_id,
      groups.catalog_id,
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
      ogc.catalog_id,
      case
        when (sum(ogc.is_option_complete) >= 1) then 1
        else 0
      end as completion
    from
      option_group_completion as ogc
    group by
      ogc.group_id,
      ogc.catalog_id,
      ogc.group_name,
      ogc.required_count,
      ogc.units
  )
  select
    gc.group_id,
    gc.catalog_id,
    gc.group_name,
    case when gc.completion = 1 then 'Completed'
    else 'Remaining' end,
    case
      when groups.requirement_type = 'all_courses' then (
        select
          concat('(AND ', string_agg(cast(c.course_id as varchar(10)), ' '), ')')
        from
          requirement_group_courses as rgc
          join courses c on rgc.course_id = c.course_id 
        where
          rgc.group_id = gc.group_id
      )
      when groups.requirement_type = 'choose_courses' then (
        select
          concat('(OR ', string_agg(cast(c.course_id as varchar(10)), ' '), ')')
        from
          requirement_group_courses as rgc
          join courses c on rgc.course_id = c.course_id
        where
          rgc.group_id = gc.group_id
      )
      when groups.requirement_type = 'choose_options' then (
        select
          concat('(OR ', string_agg(option.option_text, ' '), ')')
          
        from
          (select
            concat('(AND ', string_agg(cast(c.course_id as varchar(10)), ' '), ')') as option_text
          from
            requirement_group_courses as rgc
            join courses c on rgc.course_id = c.course_id
          where
            rgc.group_id = gc.group_id
          group by rgc.option_group) as option
      )
      when groups.requirement_type = 'min_units' then (
        select
          concat('(UNITS ', cast((groups.min_units - coalesce(sum(case when tqc.course_id is not null then taken_c.units else 0 end), 0)) as varchar(10)), ' ', string_agg(cast(c.course_id as varchar(10)), ' '), ')' )
        from
          requirement_group_courses as rgc
          left join taken_quarter_courses tqc on rgc.course_id = tqc.course_id
          left join courses taken_c on taken_c.course_id = tqc.course_id
          left join courses c on rgc.course_id = c.course_id and tqc.course_id is null
        where
          rgc.group_id = gc.group_id
      )
      else 'error: requirement type not recognized'
    end as courses_needed
  from
    group_completion gc
    join requirement_groups groups on gc.group_id = groups.group_id
  order by
    gc.group_id
  `
  return result.map((requirement) => parseRequirementString(requirement.courses_needed, courseMap))

}
async function queryTakenClasses(student_id) {
  return await sql `
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
  ),
  taken_courses as (
    select distinct
      c.course_id
    from
      mapping_group_counts as m_counts
      join course_mappings as m on m.mapping_id = m_counts.mapping_id
      and m.substitute_classes_needed = m_counts.substitute_classes -- if the student has taken all the classes in the mapping group, include it.
      join course_mapping_item item on item.mapping_id = m.mapping_id
      join courses as c on c.course_id = item.course_id
      -- include all classes that have been taken, or the student has taken all the classes on other catalog needed for credit
    union
    select
      c.course_id
    from
      student_courses as sc
      join courses as c on c.course_id = sc.course_id
    where
      sc.student_id = ${student_id}
  )
select
  c.course_id,
  (c.subject || ' ' || c.course_number) as course_code,
  c.class_name as course_name,
  c.units,
  case
    when (
      c.course_id in (
        select
          course_id
        from
          taken_courses
      )
    ) then 'Completed'
    else 'Remaining'
  end as completion
from
  courses as c
`
}

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
  const courses = await queryTakenClasses(student_id);
// convert the courses to a map from course_id to other course info
  const courseMap = new Map(courses.map((course) => [course.course_id, course]))

  try {
    const quarterRequirements = await queryNeededClasses(student_id, QUARTER_CATALOG_ID, courseMap)
    const semesterRequirements = await queryNeededClasses(student_id, SEMESTER_CATALOG_ID, courseMap)
    console.log("Quarter Requirements: " + JSON.stringify(quarterRequirements[0]))
        

return res.json({quarterRequirements, semesterRequirements});

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

    cm.mapping_id,
    cm.major_id,

    CASE
      WHEN q.course_number ~ '^[3-5]' THEN 'UPPER DIV'
      WHEN q.subject LIKE 'Gen Ed%' THEN 'GE'
      WHEN q.tech_elective_eligible THEN 'SUPPORT'
      ELSE 'LOWER DIV'
    END AS tag

  FROM public.student_courses sc

  JOIN public.courses q
    ON sc.course_id = q.course_id

  LEFT JOIN public.course_mapping_item old_item
    ON old_item.course_id = sc.course_id
    AND old_item.is_substitute = false

  LEFT JOIN public.course_mappings cm
    ON cm.mapping_id = old_item.mapping_id

  LEFT JOIN public.course_mapping_item new_item
    ON new_item.mapping_id = cm.mapping_id
    AND new_item.is_substitute = true

  LEFT JOIN public.courses s
    ON s.course_id = new_item.course_id

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
