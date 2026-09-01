import { Request, Response } from "express";
import {
  Clinic,
  Inventory,
  Medication,
  SupplyRequest,
  Warehouse,
} from "../models";
import { RequestStatus } from "../interfaces";

const VALID_STATUSES = Object.values(RequestStatus);

export async function createSupplyRequest(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { clinicId, medicationId, warehouseId, quantityRequested, notes, status } = req.body;

    if (quantityRequested <= 0) {
      return res.status(400).json({
        message: "La cantidad solicitada debe ser un número entero positivo",
      });
    }

    const clinic = await Clinic.findOne({ where: { id: clinicId, isActive: true } });
    if (!clinic) {
      return res.status(404).json({ message: "Clínica no encontrada" });
    }

    const medication = await Medication.findOne({ where: { id: medicationId, isActive: true } });
    if (!medication) {
      return res.status(404).json({ message: "Medicamento no encontrado" });
    }

    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) {
      return res.status(404).json({ message: "Almacén no encontrado" });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Estado de solicitud no permitido" });
    }

    const inventory = await Inventory.findOne({
      where: { warehouseId, medicationId },
    });
    if (!inventory || inventory.quantity < quantityRequested) {
      return res.status(400).json({
        message: "El almacén no tiene inventario suficiente del medicamento solicitado",
      });
    }

    const supplyRequest = await SupplyRequest.create({
      clinicId,
      medicationId,
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

export async function getAllSupplyRequests(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const requests = await SupplyRequest.findAll({
      where: { isActive: true },
      include: [
        { model: Clinic, as: "clinic" },
        { model: Medication, as: "medication" },
        { model: Warehouse, as: "warehouse" },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener las solicitudes", error });
  }
}

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
        { model: Clinic, as: "clinic" },
        { model: Medication, as: "medication" },
        { model: Warehouse, as: "warehouse" },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener las solicitudes activas", error });
  }
}

export async function getRequestsByClinic(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { clinicId } = req.params;

    const clinic = await Clinic.findOne({ where: { id: clinicId, isActive: true } });
    if (!clinic) {
      return res.status(404).json({ message: "Clínica no encontrada" });
    }

    const requests = await SupplyRequest.findAll({
      where: { clinicId, isActive: true },
      include: [
        { model: Medication, as: "medication" },
        { model: Warehouse, as: "warehouse" },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      clinic,
      requests,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el historial de la clínica", error });
  }
}

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