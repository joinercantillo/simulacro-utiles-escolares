import { Request, Response } from "express";
import { Inventory, SchoolSupply, Warehouse } from "../models";

/**
 * Obtiene todos los almacenes activos junto con su inventario.
 * GET /api/warehouses
 * @param req Request de Express.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la lista de almacenes activos.
 */
export async function getAllWarehouses(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const warehouses = await Warehouse.findAll({
      where: { isActive: true },
      include: [{ model: Inventory, as: "inventories", include: [{ model: SchoolSupply, as: "schoolSupply" }] }],
    });
    return res.json(warehouses);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener almacenes", error });
  }
}

/**
 * Obtiene un almacén por su ID, junto con su inventario.
 * GET /api/warehouses/:id
 * @param req Request de Express con params: { id }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con el almacén encontrado o 404 si no existe.
 */
export async function getWarehouseById(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findOne({
      where: { id, isActive: true },
      include: [{ model: Inventory, as: "inventories", include: [{ model: SchoolSupply, as: "schoolSupply" }] }],
    });

    if (!warehouse) {
      return res.status(404).json({ message: "Almacén no encontrado" });
    }

    return res.json(warehouse);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el almacén", error });
  }
}

/**
 * Crea un nuevo almacén en el sistema.
 * POST /api/warehouses
 * @param req Request de Express con body: { name, location, responsibleName, responsibleEmail }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con el almacén creado o un mensaje de error.
 */
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

/**
 * Actualiza los datos de un almacén existente.
 * PUT /api/warehouses/:id
 * @param req Request de Express con params: { id } y body con los campos a actualizar.
 * @param res Response de Express.
 * @returns Respuesta HTTP con el almacén actualizado o 404 si no existe.
 */
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

/**
 * Elimina lógicamente un almacén (soft delete).
 * DELETE /api/warehouses/:id
 * @param req Request de Express con params: { id }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con mensaje de confirmación o 404 si no existe.
 */
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