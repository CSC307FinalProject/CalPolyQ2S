import sql from "./db/index.js";

export async function getSavedCourses(req, res) {
  const { student_id } = req.params;

  try {
    const courses = await sql`
      SELECT course_id, catalog_id, subject, course_number, class_name, units, tech_elective_eligible
      FROM public.student_courses
      WHERE student_id = ${student_id}
      ORDER BY id
    `;

    return res.json({ courses });
  } catch (error) {
    console.error("Get saved courses error:", error);

    return res.status(500).json({
      error: "Failed to load saved courses.",
      details: error.message,
    });
  }
}

export async function saveCourses(req, res) {
  const { student_id, courses } = req.body;

  try {
    await sql`
      DELETE FROM public.student_courses WHERE student_id = ${student_id}
    `;

    if (courses.length > 0) {
      const rows = courses.map((course) => ({
        student_id,
        course_number: course.courseNumber,
        course_title: course.courseTitle,
        tag: course.tag,
      }));

      await sql`
        INSERT INTO public.student_courses ${sql(rows)} 
      `;
    }

    return res.json({ message: "Courses saved successfully." });
  } catch (error) {
    console.error("Save courses error:", error);
    return res
      .status(500)
      .json({ error: "Failed to save courses.", details: error.message });
  }
}
