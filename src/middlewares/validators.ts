import { NextFunction, Request, Response } from "express";

export function validateRegister(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({
      message: "Todos los campos son obligatorios: name, email, password, role",
    });
    return;
  }

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ message: "El nombre es obligatorio" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "El email no tiene un formato válido" });
    return;
  }

  if (password.length < 6) {
    res
      .status(400)
      .json({ message: "La contraseña debe tener al menos 6 caracteres" });
    return;
  }

  const validRoles = ["admin", "gestor"];
  if (!validRoles.includes(role)) {
    res
      .status(400)
      .json({ message: "El rol debe ser 'admin' o 'gestor'" });
    return;
  }

  next();
}

export function validateLogin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message: "El email y la contraseña son obligatorios",
    });
    return;
  }

  next();
}
