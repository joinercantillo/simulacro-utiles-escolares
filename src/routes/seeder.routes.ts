import { Router } from "express";
import multer from "multer";
import path from "path";
import { authenticateToken } from "../middlewares/auth";
import { runSeeder, seedAllDefault } from "../controllers/seeder.controller";

const upload = multer({
  dest: path.join(__dirname, "../../uploads"),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/json" || file.originalname.endsWith(".json")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos JSON") as any);
    }
  },
});

const router = Router();

/** @swagger
 * tags:
 *   name: Seeders
 *   description: Carga de datos base mediante archivos JSON
 */

/**
 * @swagger
 * /api/seeders/upload:
 *   post:
 *     summary: Cargar datos base desde un archivo JSON (actúa como seeders)
 *     tags: [Seeders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: Datos cargados }
 *       400: { description: Archivo inválido }
 */
router.post("/upload", authenticateToken, upload.single("file"), runSeeder);

/**
 * @swagger
 * /api/seeders/default:
 *   post:
 *     summary: Cargar datos base por defecto (usuarios, clínicas, almacenes, medicamentos, inventario)
 *     tags: [Seeders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Datos base cargados }
 */
router.post("/default", authenticateToken, seedAllDefault);

export default router;