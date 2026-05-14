import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sql from "./db/index.js";

export async function registerUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Bad request: Invalid input");
  }

  const existing = await sql`SELECT 1 FROM users WHERE email = ${email}`;
  
  // Only register new account if email not in DB
  if (existing.length > 0) {
    return res.status(409).send("Email already taken");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  await sql`INSERT INTO users (email, password_hash) VALUES (${email}, ${hashedPassword})`;

  const token = await generateAccessToken(email);
  res.status(201).send({token});
}

export async function loginUser(req, res) {
  
  const { email, password } = req.body;

  const [user] = await sql`SELECT password_hash FROM users WHERE email = ${email}`;
  if (!user) {
    return res.status(401).send("Unauthenticated");
  }

  // Incorrect password entered by user
  const matched = await bcrypt.compare(password, user.hashed_password);
  if (!matched) {
    return res.status(401).send("Unauthenticated");
  }

  const token = await generateAccessToken(email);
  res.status(200).send({ token });
}

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
