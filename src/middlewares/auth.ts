import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Middleware that authenticates the JWT token sent in the Authorization header.
 * Verifies that the token is valid and decodes the user data into req.user.
 * @param req Express Request with a Bearer-type Authorization header.
 * @param res Express Response.
 * @param next Function to continue to the next middleware if authentication succeeds.
 * @returns No return value; sends 401 if the token is missing or invalid.
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Authentication token not provided",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

/**
 * Middleware that verifies the authenticated user has one of the allowed roles.
 * @param roles User roles allowed for the route.
 * @returns Middleware that validates the user's role and calls next() or sends 401/403.
 */
export function authorizeRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: "You do not have permission to perform this action",
      });
      return;
    }

    next();
  };
}
