import "dotenv/config";
import cors from "cors";
import express from "express";
import postgres from "postgres";
import { authenticateUser, loginUser, registerUser, verifyEmail, resendVerification, resendLimit } from "./auth.js";
import classSelectorRouter from "./routes/class-selector.js";
import comparisonRouter from "./routes/comparison.js";

const app = express();
const PORT = process.env.PORT || 3000;
const sql = postgres(process.env.DATABASE_URL);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5179",
  "http://127.0.0.1:5179",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "https://orange-bay-0a230d710.7.azurestaticapps.net",
  ...(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", service: "CalPolyQ2S backend" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/login", loginUser);
app.post("/register", registerUser);
app.get("/verify-email", verifyEmail);
app.post("/resend-verification", resendLimit, resendVerification);

app.post("/users", authenticateUser, async (req, res) => {
  const { email } = req.body;
  const [user] =
    await sql`INSERT INTO students (email) VALUES (${email}) RETURNING *`;

  res.status(201).send(user);
});

app.use("/class-selector", classSelectorRouter);
app.use("/q2s-comparison", comparisonRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default sql;
