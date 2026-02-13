import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access token required",
      code: "TOKEN_MISSING",
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("CRITICAL: JWT_SECRET not set in environment variables");
      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Token has expired",
        code: "TOKEN_EXPIRED",
      });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        message: "Invalid token",
        code: "TOKEN_INVALID",
      });
    }
    return res.status(403).json({
      message: "Token verification failed",
      code: "TOKEN_VERIFICATION_FAILED",
    });
  }
};
