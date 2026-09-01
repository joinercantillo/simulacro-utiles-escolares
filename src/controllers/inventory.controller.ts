import { Request, Response } from "express";
import { Inventory, SchoolSupply, Warehouse } from "../models";

/**
 * Obtiene el inventario de un almacén específico, incluyendo información del suministro escolar.
 * GET /api/inventory/warehouse/:warehouseId
 * @param req Request de Express con params: { warehouseId }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la lista de registros de inventario del almacén.
 */
export async function getInventoryByWarehouse(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { warehouseId } = req.params;
    const inventory = await Inventory.findAll({
      where: { warehouseId },
      include: [{ model: SchoolSupply, as: "schoolSupply" }],
    });
    return res.json(inventory);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener inventario", error });
  }
}

/**
 * Agrega suministro escolar al inventario de un almacén.
 * Si ya existe un registro para el mismo almacén y suministro escolar, incrementa la cantidad.
 * POST /api/inventory
 * @param req Request de Express con body: { warehouseId, schoolSupplyId, quantity }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con el registro de inventario creado o actualizado.
 */
export async function addInventory(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { warehouseId, schoolSupplyId, quantity } = req.body;

    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) {
      return res.status(404).json({ message: "Almacén no encontrado" });
    }

    const schoolSupply = await SchoolSupply.findOne({ where: { id: schoolSupplyId, isActive: true } });
    if (!schoolSupply) {
      return res.status(404).json({ message: "Suministro escolar no encontrado" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor que cero" });
    }

    const existingInventory = await Inventory.findOne({
      where: { warehouseId, schoolSupplyId },
    });

    if (existingInventory) {
      existingInventory.quantity += quantity;
      await existingInventory.save();
      return res.json(existingInventory);
    }

    const inventory = await Inventory.create({
      warehouseId,
      schoolSupplyId,
      quantity,
    });

    return res.status(201).json(inventory);
  } catch (error) {
    return res.status(500).json({ message: "Error al agregar inventario", error });
  }
}

/**
 * Actualiza la cantidad de un registro de inventario existente.
 * PUT /api/inventory/:id
 * @param req Request de Express con params: { id } y body: { quantity }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con el registro de inventario actualizado o 404 si no existe.
 */
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