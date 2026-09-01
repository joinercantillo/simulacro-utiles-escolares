import { Request, Response } from "express";
import { Op } from "sequelize";
import { School, SchoolSupply, SupplyRequest, Warehouse } from "../models";

/**
 * Obtiene todas las instituciones activas del sistema.
 * GET /api/schools
 * @param req Request de Express.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la lista de instituciones activas.
 */
export async function getAllSchools(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const schools = await School.findAll({ where: { isActive: true } });
    return res.json(schools);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener instituciones", error });
  }
}

/**
 * Obtiene una institución por su ID, incluyendo sus solicitudes de suministro.
 * GET /api/schools/:id
 * @param req Request de Express con params: { id }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la institución encontrada o 404 si no existe.
 */
export async function getSchoolById(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const school = await School.findOne({
      where: { id, isActive: true },
      include: [
        {
          model: SupplyRequest,
          as: "requests",
          include: [
            { model: SchoolSupply, as: "schoolSupply" },
            { model: Warehouse, as: "warehouse" },
          ],
        },
      ],
    });

    if (!school) {
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    return res.json(school);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener la institución", error });
  }
}

/**
 * Crea una nueva institución en el sistema.
 * POST /api/schools
 * @param req Request de Express con body: { name, nit, address, phone, responsibleName, responsibleEmail }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la institución creada o un mensaje de error si el NIT ya existe.
 */
export async function createSchool(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { name, nit, address, phone, responsibleName, responsibleEmail } = req.body;

    const existingSchool = await School.findOne({ where: { nit } });
    if (existingSchool) {
      return res.status(409).json({ message: "Ya existe una institución con el mismo NIT" });
    }

    const school = await School.create({
      name,
      nit,
      address,
      phone,
      responsibleName,
      responsibleEmail,
    });

    return res.status(201).json(school);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear la institución", error });
  }
}

/**
 * Actualiza los datos de una institución existente.
 * PUT /api/schools/:id
 * @param req Request de Express con params: { id } y body con los campos a actualizar.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la institución actualizada o 404 si no existe.
 */
export async function updateSchool(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const school = await School.findOne({ where: { id, isActive: true } });

    if (!school) {
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    const { nit } = req.body;
    if (nit) {
      const duplicate = await School.findOne({ where: { nit, id: { [Op.ne]: id } } });
      if (duplicate) {
        return res.status(409).json({ message: "Ya existe una institución con el mismo NIT" });
      }
    }

    await school.update(req.body);
    return res.json(school);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar la institución", error });
  }
}

/**
 * Elimina lógicamente una institución (soft delete).
 * DELETE /api/schools/:id
 * @param req Request de Express con params: { id }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con mensaje de confirmación o 404 si no existe.
 */
export async function deleteSchool(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const school = await School.findOne({ where: { id, isActive: true } });

    if (!school) {
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    await school.update({ isActive: false });
    return res.json({ message: "Institución eliminada lógicamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar la institución", error });
  }
}
