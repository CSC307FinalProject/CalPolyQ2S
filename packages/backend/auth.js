import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sql from "./db/index.js";


// Registration
export async function registerUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Bad request: Invalid input");
  }

  try {
    const existing = await sql`SELECT 1 FROM students WHERE email = ${email}`;

    // Only register new account if email not in DB
    if (existing.length > 0) {
      return res.status(409).send("Email already taken");
    }

    
    // Extract everything before @ in email
    const name = email.split("@")[0];


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await sql`
      INSERT INTO students (name, email, password_hash) 
      VALUES (${name}, ${email}, ${hashedPassword})
    `;

    const token = await generateAccessToken(email);
    return res.status(201).send({ token });
  } 
  catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Registration failed.", details: error.message });
  }
}

// Login
export async function loginUser(req, res) {
  console.log("Login request body:", req.body);

  const { email, password } = req.body;

  // Match email from login form to email in DB
  try {
    const users = await sql`
      SELECT student_id, email, password_hash
      FROM public.students
      WHERE email = ${email}
    `;

    console.log("DB users:", users);

    // Error if no emails match
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = users[0];

    // Match the password from login form to the hashed password in the DB
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    // Error if password doesn't match
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate and return access token
    const token = await generateAccessToken(email);
    return res.status(200).json({ token });

  } 
  catch (error) {
    console.error("Login error details:", error);
    
    return res.status(500).json({
      error: "Login failed due to server error.",
      details: error.message,
    });
    
  }
}

// ----------------------------------------------------------------------


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

  // Return if no token received
  if (!token) {
    console.log("No token received");
    res.status(401).end();
  } 
  else { // Otherwise, verify token
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
