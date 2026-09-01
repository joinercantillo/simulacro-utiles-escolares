import { Router } from "express";
import {
  createSupplyRequest,
  deleteSupplyRequest,
  getActiveSupplyRequests,
  getAllSupplyRequests,
  getRequestsByClinic,
  updateRequestStatus,
} from "../controllers/supplyRequest.controller";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();

router.use(authenticateToken);

/** @swagger
 * tags:
 *   name: Solicitudes
 *   description: Gestión de solicitudes de abastecimiento
 */

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Crear solicitud de abastecimiento
 *     tags: [Solicitudes]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clinicId, medicationId, warehouseId, quantityRequested]
 *             properties:
 *               clinicId: { type: integer, example: 1 }
 *               medicationId: { type: integer, example: 1 }
 *               warehouseId: { type: integer, example: 1 }
 *               quantityRequested: { type: integer, example: 20 }
 *               status: { type: string, enum: [pendiente, en_proceso, aprobada, rechazada, completada], example: "pendiente" }
 *               notes: { type: string, example: "Entrega urgente" }
 *     responses:
 *       201: { description: Solicitud creada }
 *       400: { description: Validación fallida (inventario insuficiente, cantidad inválida) }
 *       404: { description: Clínica, medicamento o almacén no encontrado }
 */
router.post("/", createSupplyRequest);

/**
 * @swagger
 * /api/requests/active:
 *   get:
 *     summary: Listar solicitudes activas
 *     tags: [Solicitudes]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de solicitudes activas }
 */
router.get("/active", getActiveSupplyRequests);

/**
 * @swagger
 * /api/requests/all:
 *   get:
 *     summary: Historial completo de solicitudes
 *     tags: [Solicitudes]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista completa de solicitudes }
 */
router.get("/all", getAllSupplyRequests);

/**
 * @swagger
 * /api/requests/clinic/{clinicId}:
 *   get:
 *     summary: Historial de solicitudes por clínica
 *     tags: [Solicitudes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Historial de la clínica }
 *       404: { description: Clínica no encontrada }
 */
router.get("/clinic/:clinicId", getRequestsByClinic);

/**
 * @swagger
 * /api/requests/{id}/status:
 *   patch:
 *     summary: Actualizar estado de una solicitud
 *     tags: [Solicitudes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pendiente, en_proceso, aprobada, rechazada, completada], example: "aprobada" }
 *     responses:
 *       200: { description: Solicitud actualizada }
 *       400: { description: Estado no permitido }
 *       404: { description: Solicitud no encontrada }
 */
router.patch("/:id/status", updateRequestStatus);

/**
 * @swagger
 * /api/requests/{id}:
 *   delete:
 *     summary: Eliminar solicitud (baja lógica, solo admin)
 *     tags: [Solicitudes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Solicitud eliminada }
 *       404: { description: Solicitud no encontrada }
 */
router.delete("/:id", authorizeRoles("admin"), deleteSupplyRequest);

export default router;