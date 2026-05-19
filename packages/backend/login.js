import "dotenv/config";
import sql from "./index.js";
import cors from "cors";
import express from "express";
import bcrypt from "bcrypt";
import { supabase } from "./supabaseClient.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/saved-courses/:student_id", async (req, res) => {
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
});

app.post("/save-courses", async (req, res) => {
  const { student_id, courses } = req.body;

  const { error: deleteError } = await supabase
    .from("student_courses")
    .delete()
    .eq("student_id", student_id);

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message });
  }

  const rows = courses.map((course) => ({
    student_id,
    course_number: course.courseNumber,
    course_title: course.courseTitle,
    tag: course.tag,
  }));

  const { error: insertError } = await supabase
    .from("student_courses")
    .insert(rows);

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  return res.json({ message: "Courses saved successfully." });
});

app.post("/login", async (req, res) => {
  console.log("Login request body:", req.body);

  const { email, password } = req.body;

  try {
    const users = await sql`
      SELECT student_id, email, password_hash
      FROM public.students
      WHERE email = ${email}
    `;

    console.log("DB users:", users);

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.hash(password, 10);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    return res.json({ user: users[0] });
  } catch (error) {
    console.error("Login error details:", error);
    return res.status(500).json({
      error: "Login failed due to server error.",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
