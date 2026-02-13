import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database";

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        fields: { username: !username, email: !email, password: !password },
      });
    }

    // Validate username length
    if (username.length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters long",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Validate password strength (min 8 chars, at least one number, one special char)
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        message:
          "Password must contain at least one number and one special character",
      });
    }

    // Check if user exists
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );

    if (userCheck.rows.length > 0) {
      const existingUser = userCheck.rows[0];
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, passwordHash],
    );

    const user = newUser.rows[0];

    // Generate JWT token (consistent with login)
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("CRITICAL: JWT_SECRET not set in environment variables");
      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    const token = jwt.sign(payload, secret, { expiresIn: "24h" });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        fields: { email: !email, password: !password },
      });
    }

    // Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Ensure JWT_SECRET is set
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("CRITICAL: JWT_SECRET not set in environment variables");
      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    // Generate Token
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "24h" });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};
