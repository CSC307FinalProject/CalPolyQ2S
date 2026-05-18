import "dotenv/config";
import sql from "./db/index.js";
import cors from "cors";
import express from "express";
import { authenticateUser, loginUser, registerUser } from "./auth.js";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.post("/login", loginUser);
app.post("/register", registerUser);

app.post("/users", authenticateUser, async (req, res) => {
  const { email } = req.body;
  const [user] =
    await sql`INSERT INTO students (email) VALUES (${email}) RETURNING *`;
  res.status(201).send(user);
});

// get the classes from the db
app.get("/class-selector", async (req, res) => {
  try {
    // send the sql statement. Use aliases as names
    // connect the subject and number as coursecode
    // use course number for upper and lower div

    // use case whens so aggregate data into different tags
    const courses = await sql`
    SELECT course_id,
    subject || ' ' || course_number AS "course_code",
    class_name AS course_name,
    CASE
    WHEN course_number ~ '^[3-9]' THEN 'UPPER DIV'
    WHEN subject LIKE 'MATH%' THEN 'MATH'
    WHEN subject LIKE 'GE%' THEN 'GE'
    ELSE 'LOWER DIV'
    END AS tag
    FROM courses
    WHERE catalog_id = 1
    `;
    res.status(200).json(courses);
  } catch (err) {
    console.error("class-selector error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
