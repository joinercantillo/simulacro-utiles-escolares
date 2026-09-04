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
 *   description: Authentication and user registration
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (admin or gestor)
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
 *       201: { description: User registered }
 *       400: { description: Invalid data }
 *       409: { description: Email already registered }
 */
router.post("/register", validateRegister, async (req: Request, res: Response) => {
  const result = registerUserSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Invalid data", errors });
  }

  try {
    const existingUser = await User.findOne({ where: { email: result.data.email } });
    if (existingUser) return res.status(409).json({ message: "This email is already registered" });

    const hashedPassword = await bcrypt.hash(result.data.password, 10);
    const user = await User.create({
      ...result.data,
      password: hashedPassword,
      role: (result.data.role || "gestor") as any,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user", error });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in
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
 *       200: { description: Successful login, returns JWT token }
 *       401: { description: Invalid credentials }
 */
router.post("/login", validateLogin, async (req: Request, res: Response) => {
  const result = loginUserSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Invalid data", errors });
  }

  try {
    const user = await User.findOne({ where: { email: result.data.email } });
    if (!user || !user.isActive) return res.status(401).json({ message: "Invalid credentials" });

    const isValidPassword = await bcrypt.compare(result.data.password, user.password);
    if (!isValidPassword) return res.status(401).json({ message: "Invalid credentials" });

    const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: (process.env.JWT_EXPIRES_IN || "24h") as jwt.SignOptions["expiresIn"],
    });

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error });
  }
});

export default router;
