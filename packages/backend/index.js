import "dotenv/config";
import sql from "./db/index.js"
import cors from "cors";
import express from "express";
import { authenticateUser, loginUser, registerUser } from "./auth.js";
import { getSavedCourses, saveCourses } from "./courses.js";

const sql = postgres(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

app.post("/login", loginUser);
app.post("/register", registerUser);
app.get("/saved-courses/:student_id", authenticateUser, getSavedCourses);
app.post("/save-courses", authenticateUser, saveCourses);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

