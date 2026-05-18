import sql from "./db/index.js"
import cors from "cors";
import express from "express";
import "dotenv/config";
import { authenticateUser, loginUser, registerUser } from "./auth.js";


const sql = postgres(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

app.post("/login", loginUser);
app.post("/register", registerUser);

app.post("/users", authenticateUser, async (req, res) => {
  const {email} = req.body;
  const [user] = await sql`INSERT INTO students (email) VALUES (${email}) RETURNING *`;
  res.status(201).send(user);
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

