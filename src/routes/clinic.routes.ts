import { Router } from "express";
import {
  createClinic,
  deleteClinic,
  getAllClinics,
  getClinicById,
  updateClinic,
} from "../controllers/clinic.controller";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();

router.use(authenticateToken);

/** @swagger
 * tags:
 *   name: Clínicas
 *   description: Gestión de clínicas y centros de atención
 */

/**
 * @swagger
 * /api/clinics:
 *   get:
 *     summary: Obtener todas las clínicas
 *     tags: [Clínicas]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de clínicas }
 */
router.get("/", getAllClinics);

/**
 * @swagger
 * /api/clinics/{id}:
 *   get:
 *     summary: Obtener clínica por ID con su historial de solicitudes
 *     tags: [Clínicas]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Clínica encontrada }
 *       404: { description: Clínica no encontrada }
 */
router.get("/:id", getClinicById);

/**
 * @swagger
 * /api/clinics:
 *   post:
 *     summary: Crear una clínica (solo admin)
 *     tags: [Clínicas]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, nit, address, phone, responsibleName, responsibleEmail]
 *             properties:
 *               name: { type: string, example: "Clínica Vida Sana" }
 *               nit: { type: string, example: "900123456-1" }
 *               address: { type: string, example: "Calle 10 # 20-30" }
 *               phone: { type: string, example: "3001234567" }
 *               responsibleName: { type: string, example: "María López" }
 *               responsibleEmail: { type: string, example: "maria@vidasana.co" }
 *     responses:
 *       201: { description: Clínica creada }
 *       409: { description: NIT duplicado }
 */
router.post("/", authorizeRoles("admin"), createClinic);

/**
 * @swagger
 * /api/clinics/{id}:
 *   put:
 *     summary: Actualizar una clínica (solo admin)
 *     tags: [Clínicas]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Clínica actualizada }
 *       404: { description: Clínica no encontrada }
 */
router.put("/:id", authorizeRoles("admin"), updateClinic);

/**
 * @swagger
 * /api/clinics/{id}:
 *   delete:
 *     summary: Eliminar clínica (baja lógica, solo admin)
 *     tags: [Clínicas]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Clínica eliminada }
 *       404: { description: Clínica no encontrada }
 */
router.delete("/:id", authorizeRoles("admin"), deleteClinic);

export default router;