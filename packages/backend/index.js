import sql from "./db/index.js"
import cors from "cors";
import express from "express";
import "dotenv/config";
import { loginUser, registerUser } from "./auth.js";


const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.post("/login", loginUser);
app.post("/register", registerUser);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


