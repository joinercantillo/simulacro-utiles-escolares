import { Router } from "express";
import {
  createSchoolSupply,
  deleteSchoolSupply,
  getAllSchoolSupplies,
  getSchoolSupplyById,
  updateSchoolSupply,
} from "../controllers/schoolSupply.controller";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();

router.use(authenticateToken);

/** @swagger
 * tags:
 *   name: Suministros escolares
 *   description: Gestión de suministros escolares
 */

/**
 * @swagger
 * /api/school-supplies:
 *   get:
 *     summary: Obtener todos los suministros escolares
 *     tags: [Suministros escolares]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de suministros escolares }
 */
router.get("/", getAllSchoolSupplies);

/**
 * @swagger
 * /api/school-supplies/{id}:
 *   get:
 *     summary: Obtener suministro escolar por ID
 *     tags: [Suministros escolares]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Suministro escolar encontrado }
 *       404: { description: Suministro escolar no encontrado }
 */
router.get("/:id", getSchoolSupplyById);

/**
 * @swagger
 * /api/school-supplies:
 *   post:
 *     summary: Crear suministro escolar (solo admin)
 *     tags: [Suministros escolares]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category]
 *             properties:
 *               name: { type: string, example: "Cuaderno cuadriculado" }
 *               description: { type: string, example: "Cuaderno de 100 hojas A5" }
 *               category: { type: string, example: "Papelería" }
 *               unit: { type: string, example: "unidad" }
 *     responses:
 *       201: { description: Suministro escolar creado }
 */
router.post("/", authorizeRoles("admin"), createSchoolSupply);

/**
 * @swagger
 * /api/school-supplies/{id}:
 *   put:
 *     summary: Actualizar suministro escolar (solo admin)
 *     tags: [Suministros escolares]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Suministro escolar actualizado }
 *       404: { description: Suministro escolar no encontrado }
 */
router.put("/:id", authorizeRoles("admin"), updateSchoolSupply);

/**
 * @swagger
 * /api/school-supplies/{id}:
 *   delete:
 *     summary: Eliminar suministro escolar (baja lógica, solo admin)
 *     tags: [Suministros escolares]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Suministro escolar eliminado }
 *       404: { description: Suministro escolar no encontrado }
 */
router.delete("/:id", authorizeRoles("admin"), deleteSchoolSupply);

export default router;