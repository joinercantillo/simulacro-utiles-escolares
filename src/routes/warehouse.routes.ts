import { Router } from "express";
import {
  createWarehouse,
  deleteWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
} from "../controllers/warehouse.controller";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();

router.use(authenticateToken);

/** @swagger
 * tags:
 *   name: Almacenes
 *   description: Gestión de almacenes e inventario
 */

/**
 * @swagger
 * /api/warehouses:
 *   get:
 *     summary: Obtener todos los almacenes
 *     tags: [Almacenes]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de almacenes }
 */
router.get("/", getAllWarehouses);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   get:
 *     summary: Obtener almacén por ID
 *     tags: [Almacenes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Almacén encontrado }
 *       404: { description: Almacén no encontrado }
 */
router.get("/:id", getWarehouseById);

/**
 * @swagger
 * /api/warehouses:
 *   post:
 *     summary: Crear almacén (solo admin)
 *     tags: [Almacenes]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location, responsibleName, responsibleEmail]
 *             properties:
 *               name: { type: string, example: "Almacén Central" }
 *               location: { type: string, example: "Zona Industrial Norte Bodega 1" }
 *               responsibleName: { type: string, example: "Ana Torres" }
 *               responsibleEmail: { type: string, example: "ana@riwimed.co" }
 *     responses:
 *       201: { description: Almacén creado }
 */
router.post("/", authorizeRoles("admin"), createWarehouse);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   put:
 *     summary: Actualizar almacén (solo admin)
 *     tags: [Almacenes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Almacén actualizado }
 *       404: { description: Almacén no encontrado }
 */
router.put("/:id", authorizeRoles("admin"), updateWarehouse);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   delete:
 *     summary: Eliminar almacén (baja lógica, solo admin)
 *     tags: [Almacenes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Almacén eliminado }
 *       404: { description: Almacén no encontrado }
 */
router.delete("/:id", authorizeRoles("admin"), deleteWarehouse);

export default router;