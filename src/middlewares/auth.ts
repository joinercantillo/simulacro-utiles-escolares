import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../interfaces";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Middleware que autentica el token JWT enviado en el header Authorization.
 * Verifica que el token sea válido y decodifica los datos del usuario en req.user.
 * @param req Request de Express con header Authorization tipo Bearer.
 * @param res Response de Express.
 * @param next Función que continúa al siguiente middleware si la autenticación es exitosa.
 * @returns No retorna valor; envía 401 si el token falta o es inválido.
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Token de autenticación no proporcionado",
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
      message: "Token inválido o expirado",
    });
  }
}

/**
 * Middleware que verifica que el usuario autenticado tenga uno de los roles permitidos.
 * @param roles Roles de usuario permitidos para la ruta.
 * @returns Middleware que valida el rol del usuario y llama a next() o envía 401/403.
 */
export function authorizeRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        message: "Usuario no autenticado",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: "No tienes permisos para realizar esta acción",
      });
      return;
    }

    next();
  };
}
