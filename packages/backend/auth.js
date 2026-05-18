import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sql from "./db/index.js";


// Registration
export async function registerUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Bad request: Invalid input");
  }

  const existing = await sql`SELECT 1 FROM students WHERE email = ${email}`;
  
  // Only register new account if email not in DB
  if (existing.length > 0) {
    return res.status(409).send("Email already taken");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  await sql`INSERT INTO students (email, password_hash) VALUES (${email}, ${hashedPassword})`;

  const token = await generateAccessToken(email);
  res.status(201).send({token});
}

export async function loginUser(req, res) {
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
}


// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------


function generateAccessToken(email) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { email: email }, 
      process.env.TOKEN_SECRET,
      { expiresIn: "1d" },
      (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    );
  });
}

export function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  //Getting the 2nd part of the auth header (the token)
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token received");
    res.status(401).end();
  } else {
    jwt.verify(
      token,
      process.env.TOKEN_SECRET,
      (error, decoded) => {
        if (decoded) {
          next();
        } else {
          console.log("JWT error:", error);
          res.status(401).end();
        }
      }
    );
  }
}
