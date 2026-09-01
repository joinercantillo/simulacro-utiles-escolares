import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { JwtPayload, UserRole } from "../interfaces";

export async function register(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "El email ya se encuentra registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role as UserRole,
    });

    return res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al registrar usuario", error });
  }
}

export async function login(req: Request, res: Response): Promise<Response> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: (process.env.JWT_EXPIRES_IN || "24h") as jwt.SignOptions["expiresIn"],
    });

    return res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al iniciar sesión", error });
  }
}
