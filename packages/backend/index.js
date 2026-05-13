import sql from "../db/index.js"
import cors from "cors";
import express from "express";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT;

