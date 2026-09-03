import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { registerUserSchema, loginUserSchema } from "../models/user.model";
import { JwtPayload } from "../types";
import { validateLogin, validateRegister } from "../middlewares/validators";

const router = Router();

/** @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y registro de usuarios
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario (admin o gestor)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string, example: "Ana Torres" }
 *               email: { type: string, example: "ana@riwischool.co" }
 *               password: { type: string, example: "clave123" }
 *               role: { type: string, enum: [admin, gestor], example: "admin" }
 *     responses:
 *       201: { description: Usuario registrado }
 *       400: { description: Datos inválidos }
 *       409: { description: Email ya registrado }
 */
router.post("/register", validateRegister, async (req: Request, res: Response) => {
  const result = registerUserSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }

  try {
    const existingUser = await User.findOne({ where: { email: result.data.email } });
    if (existingUser) return res.status(409).json({ message: "El email ya se encuentra registrado" });

    const hashedPassword = await bcrypt.hash(result.data.password, 10);
    const user = await User.create({
      ...result.data,
      password: hashedPassword,
      role: (result.data.role || "gestor") as any,
    });

    return res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al registrar usuario", error });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "ana@riwischool.co" }
 *               password: { type: string, example: "clave123" }
 *     responses:
 *       200: { description: Login exitoso, retorna token JWT }
 *       401: { description: Credenciales inválidas }
 */
router.post("/login", validateLogin, async (req: Request, res: Response) => {
  const result = loginUserSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }

  try {
    const user = await User.findOne({ where: { email: result.data.email } });
    if (!user || !user.isActive) return res.status(401).json({ message: "Credenciales inválidas" });

    const isValidPassword = await bcrypt.compare(result.data.password, user.password);
    if (!isValidPassword) return res.status(401).json({ message: "Credenciales inválidas" });

    const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: (process.env.JWT_EXPIRES_IN || "24h") as jwt.SignOptions["expiresIn"],
    });

    return res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al iniciar sesión", error });
  }
});

export default router;
