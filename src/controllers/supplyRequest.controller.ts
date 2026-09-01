import { Request, Response } from "express";
import {
  School,
  Inventory,
  SchoolSupply,
  SupplyRequest,
  Warehouse,
} from "../models";
import { RequestStatus } from "../interfaces";

const VALID_STATUSES = Object.values(RequestStatus);

/**
 * Crea una solicitud de suministro validando la existencia de institución, suministro escolar y almacén, y el inventario disponible.
 * Al crearse, descuenta la cantidad solicitada del inventario del almacén.
 * POST /api/supply-requests
 * @param req Request de Express con body: { schoolId, schoolSupplyId, warehouseId, quantityRequested, notes?, status? }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la solicitud creada o un mensaje de error de validación.
 */
export async function createSupplyRequest(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { schoolId, schoolSupplyId, warehouseId, quantityRequested, notes, status } = req.body;

    if (quantityRequested <= 0) {
      return res.status(400).json({
        message: "La cantidad solicitada debe ser un número entero positivo",
      });
    }

    const school = await School.findOne({ where: { id: schoolId, isActive: true } });
    if (!school) {
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    const schoolSupply = await SchoolSupply.findOne({ where: { id: schoolSupplyId, isActive: true } });
    if (!schoolSupply) {
      return res.status(404).json({ message: "Suministro escolar no encontrado" });
    }

    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) {
      return res.status(404).json({ message: "Almacén no encontrado" });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Estado de solicitud no permitido" });
    }

    const inventory = await Inventory.findOne({
      where: { warehouseId, schoolSupplyId },
    });
    if (!inventory || inventory.quantity < quantityRequested) {
      return res.status(400).json({
        message: "El almacén no tiene inventario suficiente del suministro escolar solicitado",
      });
    }

    const supplyRequest = await SupplyRequest.create({
      schoolId,
      schoolSupplyId,
      warehouseId,
      quantityRequested,
      status: status || RequestStatus.PENDIENTE,
      notes,
    });

    inventory.quantity -= quantityRequested;
    await inventory.save();

    return res.status(201).json(supplyRequest);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear la solicitud", error });
  }
}

/**
 * Obtiene todas las solicitudes de suministro activas con sus relaciones.
 * GET /api/supply-requests
 * @param req Request de Express.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la lista de solicitudes de suministro.
 */
export async function getAllSupplyRequests(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const requests = await SupplyRequest.findAll({
      where: { isActive: true },
      include: [
        { model: School, as: "school" },
        { model: SchoolSupply, as: "schoolSupply" },
        { model: Warehouse, as: "warehouse" },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener las solicitudes", error });
  }
}

/**
 * Obtiene las solicitudes de suministro activas con estado pendiente, en proceso o aprobada.
 * @param req Request de Express.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la lista de solicitudes activas.
 */
export async function getActiveSupplyRequests(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const requests = await SupplyRequest.findAll({
      where: {
        isActive: true,
        status: [RequestStatus.PENDIENTE, RequestStatus.EN_PROCESO, RequestStatus.APROBADA],
      },
      include: [
        { model: School, as: "school" },
        { model: SchoolSupply, as: "schoolSupply" },
        { model: Warehouse, as: "warehouse" },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener las solicitudes activas", error });
  }
}

/**
 * Obtiene el historial de solicitudes de suministro de una institución específica.
 * GET /api/supply-requests/school/:schoolId
 * @param req Request de Express con params: { schoolId }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la institución y su lista de solicitudes de suministro.
 */
export async function getRequestsBySchool(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { schoolId } = req.params;

    const school = await School.findOne({ where: { id: schoolId, isActive: true } });
    if (!school) {
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    const requests = await SupplyRequest.findAll({
      where: { schoolId, isActive: true },
      include: [
        { model: SchoolSupply, as: "schoolSupply" },
        { model: Warehouse, as: "warehouse" },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      school,
      requests,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el historial de la institución", error });
  }
}

/**
 * Actualiza el estado de una solicitud de suministro existente.
 * PUT /api/supply-requests/:id/status
 * @param req Request de Express con params: { id } y body: { status }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la solicitud actualizada o un mensaje de error de validación.
 */
export async function updateRequestStatus(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Estado de solicitud no permitido" });
    }

    const supplyRequest = await SupplyRequest.findOne({
      where: { id, isActive: true },
    });

    if (!supplyRequest) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    await supplyRequest.update({ status });
    return res.json(supplyRequest);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar la solicitud", error });
  }
}

/**
 * Elimina lógicamente una solicitud de suministro (soft delete).
 * DELETE /api/supply-requests/:id
 * @param req Request de Express con params: { id }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con mensaje de confirmación o 404 si no existe.
 */
export async function deleteSupplyRequest(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const supplyRequest = await SupplyRequest.findOne({
      where: { id, isActive: true },
    });

    if (!supplyRequest) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    await supplyRequest.update({ isActive: false });
    return res.json({ message: "Solicitud eliminada lógicamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar la solicitud", error });
  }
}