import "dotenv/config";
import cors from "cors";
import express from "express";
import postgres from "postgres";
import { authenticateUser, loginUser, registerUser } from "./auth.js";
import classSelectorRouter from "./routes/class-selector.js";
import comparisonRouter from "./routes/comparison.js";

const app = express();
const PORT = process.env.PORT || 3000;
const sql = postgres(process.env.DATABASE_URL);

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

// define router from class selector
app.use("/class-selector", classSelectorRouter);

// define router for q2s comparison
app.use("/q2s-comparison", comparisonRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default sql;
