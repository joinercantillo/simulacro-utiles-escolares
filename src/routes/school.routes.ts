import { Router } from "express";
import {
  createSchool,
  deleteSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
} from "../controllers/school.controller";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();

router.use(authenticateToken);

/** @swagger
 * tags:
 *   name: Instituciones
 *   description: Gestión de instituciones educativas
 */

/**
 * @swagger
 * /api/schools:
 *   get:
 *     summary: Obtener todas las instituciones
 *     tags: [Instituciones]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de instituciones }
 */
router.get("/", getAllSchools);

/**
 * @swagger
 * /api/schools/{id}:
 *   get:
 *     summary: Obtener institución por ID con su historial de solicitudes
 *     tags: [Instituciones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Institución encontrada }
 *       404: { description: Institución no encontrada }
 */
router.get("/:id", getSchoolById);

/**
 * @swagger
 * /api/schools:
 *   post:
 *     summary: Crear una institución (solo admin)
 *     tags: [Instituciones]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, nit, address, phone, responsibleName, responsibleEmail]
 *             properties:
 *               name: { type: string, example: "Colegio La Esperanza" }
 *               nit: { type: string, example: "900123456-1" }
 *               address: { type: string, example: "Calle 10 # 20-30" }
 *               phone: { type: string, example: "3001234567" }
 *               responsibleName: { type: string, example: "María López" }
 *               responsibleEmail: { type: string, example: "maria.lopez@esperanza.co" }
 *     responses:
 *       201: { description: Institución creada }
 *       409: { description: NIT duplicado }
 */
router.post("/", authorizeRoles("admin"), createSchool);

/**
 * @swagger
 * /api/schools/{id}:
 *   put:
 *     summary: Actualizar una institución (solo admin)
 *     tags: [Instituciones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Institución actualizada }
 *       404: { description: Institución no encontrada }
 */
router.put("/:id", authorizeRoles("admin"), updateSchool);

/**
 * @swagger
 * /api/schools/{id}:
 *   delete:
 *     summary: Eliminar institución (baja lógica, solo admin)
 *     tags: [Instituciones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Institución eliminada }
 *       404: { description: Institución no encontrada }
 */
router.delete("/:id", authorizeRoles("admin"), deleteSchool);

export default router;