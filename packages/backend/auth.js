import "dotenv/config";
import sql from "./index.js";
import cors from "cors";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import crypto from "crypto";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";


// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// Send Email
export async function sendEmail(email, token) {
  try {
    
    // Generate verification link variable from base url and generated token
    const verificationLink = `${process.env.VERIFICATION_LINK_BASE_URL}/verify-email?token=${token}`;
    
    // Add verification link into html email body
    const emailHtml = readFileSync(new URL("./components/email-body.html", import.meta.url), "utf-8")
      .replace("{{VERIFICATION_LINK}}", verificationLink);

    const info = await transporter.sendMail({
      from: `"Cal Poly Q2S" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your Cal Poly Q2S Account",
      html: emailHtml
    });

    console.log("Message sent: %s", info.messageId);

  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}


// Registration
export async function registerUser(req, res) {
  const { email, password } = req.body;

  // Input validity check
  if (!email || !password) {
    return res.status(400).send({ error: "Bad request: Invalid input" });
  }

  try {
    // Find potential existing email already in DB
    const existing = await sql`SELECT 1 FROM students WHERE email = ${email}`;

    // Only register new account if email not in DB
    if (existing.length > 0) {
      return res.status(409).send({ error: "Email already taken" });
    }

    // Extract everything before @ in email
    const name = email.split("@")[0];

    // Salt and hash the user's input with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Password MUST be hashed here!!

    // Add to students table, get the values
    // use js destructuring to pull out first element of new user (student id)
    const [newUser] = await sql`
      INSERT INTO students (name, email, password_hash)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING student_id;
    `;

    // Generate a JWT token with 24 hour expiry and send it through email
    const verificationToken = jwt.sign(
      { email, type: "email_verification" },
      process.env.TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    await sendEmail(email, verificationToken);
    return res.status(201).json({ student_id: newUser.student_id, email });

  } 
  catch (error) {
    console.error("Register error:", error);
    return res
      .status(500)
      .json({ error: "Registration failed.", details: error.message });
  }
}

// Login
export async function loginUser(req, res) {
  console.log("Login request body:", req.body);

  const { email, password } = req.body;

  // Match email from login form to email in DB
  try {
    const users = await sql`
      SELECT student_id, email, password_hash, email_verified
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

    // Block login if email not verified
    if (!user.email_verified) {
      return res.status(403).json({ error: "Email not verified. Please check your inbox." });
    }

    // Generate and return access token
    const token = await generateAccessToken(email);
    return res
      .status(200)
      .json({ token, student_id: user.student_id, email: user.email });
  } catch (error) {
    console.error("Login error details:", error);

    return res.status(500).json({
      error: "Login failed due to server error.",
      details: error.message,
    });
  }
}

// Verify Email
export async function verifyEmail(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Missing token." });
  }

  try {
    // Verify the JWT and check it's a verification token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    if (decoded.type !== "email_verification") {
      return res.status(400).json({ error: "Invalid token." });
    }

    const [student] = await sql`
      SELECT student_id, email_verified FROM students WHERE email = ${decoded.email}
    `;

    if (!student) {
      return res.status(400).json({ error: "Account not found." });
    }

    if (student.email_verified) {
      return res.status(200).json({ message: "Email already verified." });
    }

    await sql`
      UPDATE students SET email_verified = true WHERE email = ${decoded.email}
    `;

    return res.status(200).json({ message: "Email verified successfully." });

  } catch (error) {
    // jwt.verify throws if expired or invalid
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Token expired. Please request a new verification email." });
    }
    console.error("Verify email error:", error);
    return res.status(400).json({ error: "Invalid token." });
  }
}

// Maximum 3 attempts per 15 minutes
export const resendLimit = rateLimit({
  // Window of 15 min
  windowMs: 15 * 60 * 1000,
  
  // Max attempts
  max: 3,
  
  // Generate key based on IPv6
  keyGenerator: (req) => req.body?.email ?? ipKeyGenerator(req),
  message: { error: "Too many resend attempts. Please wait 15 minutes." },
});

// Resend Verification Email
export async function resendVerification(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing email." });
  }

  try {
    const [student] = await sql`
      SELECT student_id, email_verified FROM students WHERE email = ${email}
    `;

    if (!student) {
      return res.status(404).json({ error: "Account not found." });
    }

    if (student.email_verified) {
      return res.status(400).json({ error: "Email already verified." });
    }

    // 24 hour expiry verification token
    const verificationToken = jwt.sign(
      { email, type: "email_verification" },
      process.env.TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    await sendEmail(email, verificationToken);
    return res.status(200).json({ message: "Verification email resent." });

  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({ error: "Failed to resend verification.", details: error.message });
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
      },
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
  } else {
    // Otherwise, verify token
    jwt.verify(token, process.env.TOKEN_SECRET, async (error, decoded) => {
      if (decoded) {
        // Check email is verified before allowing access to protected routes
        const [student] = await sql`
          SELECT email_verified FROM students WHERE email = ${decoded.email}
        `;

        if (!student || !student.email_verified) {
          return res.status(403).json({ error: "Email not verified." });
        }

        next();
      } else {
        console.log("JWT error:", error);
        res.status(401).end();
      }
    });
  }
}
