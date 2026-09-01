import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { validateLogin, validateRegister } from "../middlewares/validators";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
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
 *               email: { type: string, example: "ana@riwimed.co" }
 *               password: { type: string, example: "clave123" }
 *               role: { type: string, enum: [admin, gestor], example: "admin" }
 *     responses:
 *       201: { description: Usuario registrado }
 *       400: { description: Datos inválidos }
 *       409: { description: Email ya registrado }
 */
router.post("/register", validateRegister, register);

/**
 * @swagger
 * /api/auth/login:
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
 *               email: { type: string, example: "ana@riwimed.co" }
 *               password: { type: string, example: "clave123" }
 *     responses:
 *       200: { description: Login exitoso, retorna token JWT }
 *       401: { description: Credenciales inválidas }
 */
router.post("/login", validateLogin, login);

export default router;