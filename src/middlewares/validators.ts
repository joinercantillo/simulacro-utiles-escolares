import { NextFunction, Request, Response } from "express";

/**
 * Middleware that validates the user registration fields.
 * Verifies that name, email, password and role are required and have valid formats.
 * @param req Express Request with body: { name, email, password, role }.
 * @param res Express Response.
 * @param next Function that continues to the next middleware if validation succeeds.
 * @returns No return value; sends 400 if validation fails.
 */
export function validateRegister(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({
      message: "All fields are required: name, email, password, role",
    });
    return;
  }

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ message: "Name is required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Email does not have a valid format" });
    return;
  }

  if (password.length < 6) {
    res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
    return;
  }

  const validRoles = ["admin", "gestor"];
  if (!validRoles.includes(role)) {
    res
      .status(400)
      .json({ message: "Role must be 'admin' or 'gestor'" });
    return;
  }

  next();
}

/**
 * Middleware that validates the login fields.
 * Verifies that the email and password are present.
 * @param req Express Request with body: { email, password }.
 * @param res Express Response.
 * @param next Function that continues to the next middleware if validation succeeds.
 * @returns No return value; sends 400 if fields are missing.
 */
export function validateLogin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message: "Email and password are required",
    });
    return;
  }

  next();
}
