import { Router } from "express";
import {
  createMedication,
  deleteMedication,
  getAllMedications,
  getMedicationById,
  updateMedication,
} from "../controllers/medication.controller";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();

router.use(authenticateToken);

/** @swagger
 * tags:
 *   name: Medicamentos
 *   description: Gestión de medicamentos
 */

/**
 * @swagger
 * /api/medications:
 *   get:
 *     summary: Obtener todos los medicamentos
 *     tags: [Medicamentos]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de medicamentos }
 */
router.get("/", getAllMedications);

/**
 * @swagger
 * /api/medications/{id}:
 *   get:
 *     summary: Obtener medicamento por ID
 *     tags: [Medicamentos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Medicamento encontrado }
 *       404: { description: Medicamento no encontrado }
 */
router.get("/:id", getMedicationById);

/**
 * @swagger
 * /api/medications:
 *   post:
 *     summary: Crear medicamento (solo admin)
 *     tags: [Medicamentos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category]
 *             properties:
 *               name: { type: string, example: "Acetaminofén" }
 *               description: { type: string, example: "Analgésico y antipirético" }
 *               category: { type: string, example: "Analgésicos" }
 *               unit: { type: string, example: "caja" }
 *     responses:
 *       201: { description: Medicamento creado }
 */
router.post("/", authorizeRoles("admin"), createMedication);

/**
 * @swagger
 * /api/medications/{id}:
 *   put:
 *     summary: Actualizar medicamento (solo admin)
 *     tags: [Medicamentos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Medicamento actualizado }
 *       404: { description: Medicamento no encontrado }
 */
router.put("/:id", authorizeRoles("admin"), updateMedication);

/**
 * @swagger
 * /api/medications/{id}:
 *   delete:
 *     summary: Eliminar medicamento (baja lógica, solo admin)
 *     tags: [Medicamentos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Medicamento eliminado }
 *       404: { description: Medicamento no encontrado }
 */
router.delete("/:id", authorizeRoles("admin"), deleteMedication);

export default router;