import { Request, Response } from "express";
import { Inventory, Medication, Warehouse } from "../models";

export async function getAllWarehouses(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const warehouses = await Warehouse.findAll({
      where: { isActive: true },
      include: [{ model: Inventory, as: "inventories", include: [{ model: Medication, as: "medication" }] }],
    });
    return res.json(warehouses);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener almacenes", error });
  }
}

export async function getWarehouseById(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findOne({
      where: { id, isActive: true },
      include: [{ model: Inventory, as: "inventories", include: [{ model: Medication, as: "medication" }] }],
    });

    if (!warehouse) {
      return res.status(404).json({ message: "Almacén no encontrado" });
    }

    return res.json(warehouse);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el almacén", error });
  }
}

export async function createWarehouse(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { name, location, responsibleName, responsibleEmail } = req.body;
    const warehouse = await Warehouse.create({
      name,
      location,
      responsibleName,
      responsibleEmail,
    });
    return res.status(201).json(warehouse);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear el almacén", error });
  }
}

export async function updateWarehouse(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findOne({ where: { id, isActive: true } });

    if (!warehouse) {
      return res.status(404).json({ message: "Almacén no encontrado" });
    }

    await warehouse.update(req.body);
    return res.json(warehouse);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar el almacén", error });
  }
}

export async function deleteWarehouse(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findOne({ where: { id, isActive: true } });

    if (!warehouse) {
      return res.status(404).json({ message: "Almacén no encontrado" });
    }

    await warehouse.update({ isActive: false });
    return res.json({ message: "Almacén eliminado lógicamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar el almacén", error });
  }
}