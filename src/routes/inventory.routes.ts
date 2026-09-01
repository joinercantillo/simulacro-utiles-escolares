import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  addInventory,
  getInventoryByWarehouse,
  updateInventory,
} from "../controllers/inventory.controller";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();

router.use(authenticateToken);

/** @swagger
 * tags:
 *   name: Inventario
 *   description: Gestión de inventario por almacén
 */

/**
 * @swagger
 * /api/inventory/warehouse/{warehouseId}:
 *   get:
 *     summary: Obtener inventario de un almacén
 *     tags: [Inventario]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Inventario del almacén }
 */
router.get("/warehouse/:warehouseId", getInventoryByWarehouse);

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Agregar stock a inventario (solo admin)
 *     tags: [Inventario]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [warehouseId, medicationId, quantity]
 *             properties:
 *               warehouseId: { type: integer, example: 1 }
 *               medicationId: { type: integer, example: 1 }
 *               quantity: { type: integer, example: 50 }
 *     responses:
 *       201: { description: Inventario actualizado }
 */
router.post("/", authorizeRoles("admin"), addInventory);

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Actualizar cantidad de inventario (solo admin)
 *     tags: [Inventario]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Inventario actualizado }
 *       404: { description: Registro no encontrado }
 */
router.put("/:id", authorizeRoles("admin"), updateInventory);

export default router;