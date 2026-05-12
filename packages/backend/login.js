import sql from "./db/index.js";
import cors from "cors";
import express from "express";
import "dotenv/config";
import bcrypt from "bcrypt";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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

    const passwordMatch = await bcrypt.hash("password", 10);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    return res.json({ user: users[0] });
  } catch (error) {
    console.error("Login error details:", error);
    return res.status(500).json({
      error: "Login failed due to server error.",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
