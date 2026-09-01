import { NextFunction, Request, Response } from "express";

/**
 * Middleware que valida los campos de registro de un usuario.
 * Verifica que name, email, password y role sean obligatorios y tengan formatos válidos.
 * @param req Request de Express con body: { name, email, password, role }.
 * @param res Response de Express.
 * @param next Función que continúa al siguiente middleware si la validación es exitosa.
 * @returns No retorna valor; envía 400 si la validación falla.
 */
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

/**
 * Middleware que valida los campos de inicio de sesión.
 * Verifica que el email y la contraseña estén presentes.
 * @param req Request de Express con body: { email, password }.
 * @param res Response de Express.
 * @param next Función que continúa al siguiente middleware si la validación es exitosa.
 * @returns No retorna valor; envía 400 si faltan campos.
 */
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
