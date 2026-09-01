import { Request, Response } from "express";
import { Inventory, Medication, Warehouse } from "../models";

export async function getInventoryByWarehouse(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { warehouseId } = req.params;
    const inventory = await Inventory.findAll({
      where: { warehouseId },
      include: [{ model: Medication, as: "medication" }],
    });
    return res.json(inventory);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener inventario", error });
  }
}

export async function addInventory(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { warehouseId, medicationId, quantity } = req.body;

    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) {
      return res.status(404).json({ message: "Almacén no encontrado" });
    }

    const medication = await Medication.findOne({ where: { id: medicationId, isActive: true } });
    if (!medication) {
      return res.status(404).json({ message: "Medicamento no encontrado" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor que cero" });
    }

    const existingInventory = await Inventory.findOne({
      where: { warehouseId, medicationId },
    });

    if (existingInventory) {
      existingInventory.quantity += quantity;
      await existingInventory.save();
      return res.json(existingInventory);
    }

    const inventory = await Inventory.create({
      warehouseId,
      medicationId,
      quantity,
    });

    return res.status(201).json(inventory);
  } catch (error) {
    return res.status(500).json({ message: "Error al agregar inventario", error });
  }
}

export async function updateInventory(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ message: "La cantidad no puede ser negativa" });
    }

    const inventory = await Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({ message: "Registro de inventario no encontrado" });
    }

    await inventory.update({ quantity });
    return res.json(inventory);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar inventario", error });
  }
}