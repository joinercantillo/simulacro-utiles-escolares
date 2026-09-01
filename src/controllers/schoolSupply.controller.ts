import { Request, Response } from "express";
import { SchoolSupply } from "../models";

/**
 * Obtiene todos los suministros escolares activos del sistema.
 * GET /api/school-supplies
 * @param req Request de Express.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la lista de suministros escolares activos.
 */
export async function getAllSchoolSupplies(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const schoolSupplies = await SchoolSupply.findAll({ where: { isActive: true } });
    return res.json(schoolSupplies);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener suministros escolares", error });
  }
}

/**
 * Obtiene un suministro escolar por su ID.
 * GET /api/school-supplies/:id
 * @param req Request de Express con params: { id }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con el suministro escolar encontrado o 404 si no existe.
 */
export async function getSchoolSupplyById(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const schoolSupply = await SchoolSupply.findOne({
      where: { id, isActive: true },
    });

    if (!schoolSupply) {
      return res.status(404).json({ message: "Suministro escolar no encontrado" });
    }

    return res.json(schoolSupply);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el suministro escolar", error });
  }
}

/**
 * Crea un nuevo suministro escolar en el sistema.
 * POST /api/school-supplies
 * @param req Request de Express con body: { name, description, category, unit? }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con el suministro escolar creado o un mensaje de error si el nombre ya existe.
 */
export async function createSchoolSupply(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { name, description, category, unit } = req.body;

    const existingSchoolSupply = await SchoolSupply.findOne({ where: { name } });
    if (existingSchoolSupply) {
      return res.status(409).json({ message: "Ya existe un suministro escolar con el mismo nombre" });
    }

    const schoolSupply = await SchoolSupply.create({
      name,
      description,
      category,
      unit: unit || "unidad",
    });

    return res.status(201).json(schoolSupply);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear el suministro escolar", error });
  }
}

/**
 * Actualiza los datos de un suministro escolar existente.
 * PUT /api/school-supplies/:id
 * @param req Request de Express con params: { id } y body con los campos a actualizar.
 * @param res Response de Express.
 * @returns Respuesta HTTP con el suministro escolar actualizado o 404 si no existe.
 */
export async function updateSchoolSupply(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const schoolSupply = await SchoolSupply.findOne({ where: { id, isActive: true } });

    if (!schoolSupply) {
      return res.status(404).json({ message: "Suministro escolar no encontrado" });
    }

    await schoolSupply.update(req.body);
    return res.json(schoolSupply);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar el suministro escolar", error });
  }
}

/**
 * Elimina lógicamente un suministro escolar (soft delete).
 * DELETE /api/school-supplies/:id
 * @param req Request de Express con params: { id }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con mensaje de confirmación o 404 si no existe.
 */
export async function deleteSchoolSupply(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const schoolSupply = await SchoolSupply.findOne({ where: { id, isActive: true } });

    if (!schoolSupply) {
      return res.status(404).json({ message: "Suministro escolar no encontrado" });
    }

    await schoolSupply.update({ isActive: false });
    return res.json({ message: "Suministro escolar eliminado lógicamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar el suministro escolar", error });
  }
}