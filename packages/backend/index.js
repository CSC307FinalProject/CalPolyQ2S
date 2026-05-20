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
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "https://orange-bay-0a230d710.7.azurestaticapps.net",
];
const configuredAllowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...configuredAllowedOrigins,
]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));
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
