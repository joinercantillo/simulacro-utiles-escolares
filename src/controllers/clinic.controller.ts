import { Request, Response } from "express";
import { Op } from "sequelize";
import { Clinic, Medication, SupplyRequest, Warehouse } from "../models";

/**
 * Obtiene todas las clínicas activas del sistema.
 * GET /api/clinics
 * @param req Request de Express.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la lista de clínicas activas.
 */
export async function getAllClinics(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const clinics = await Clinic.findAll({ where: { isActive: true } });
    return res.json(clinics);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener clínicas", error });
  }
}

/**
 * Obtiene una clínica por su ID, incluyendo sus solicitudes de insumo.
 * GET /api/clinics/:id
 * @param req Request de Express con params: { id }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la clínica encontrada o 404 si no existe.
 */
export async function getClinicById(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findOne({
      where: { id, isActive: true },
      include: [
        {
          model: SupplyRequest,
          as: "requests",
          include: [
            { model: Medication, as: "medication" },
            { model: Warehouse, as: "warehouse" },
          ],
        },
      ],
    });

    if (!clinic) {
      return res.status(404).json({ message: "Clínica no encontrada" });
    }

    return res.json(clinic);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener la clínica", error });
  }
}

/**
 * Crea una nueva clínica en el sistema.
 * POST /api/clinics
 * @param req Request de Express con body: { name, nit, address, phone, responsibleName, responsibleEmail }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la clínica creada o un mensaje de error si el NIT ya existe.
 */
export async function createClinic(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { name, nit, address, phone, responsibleName, responsibleEmail } = req.body;

    const existingClinic = await Clinic.findOne({ where: { nit } });
    if (existingClinic) {
      return res.status(409).json({ message: "Ya existe una clínica con el mismo NIT" });
    }

    const clinic = await Clinic.create({
      name,
      nit,
      address,
      phone,
      responsibleName,
      responsibleEmail,
    });

    return res.status(201).json(clinic);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear la clínica", error });
  }
}

/**
 * Actualiza los datos de una clínica existente.
 * PUT /api/clinics/:id
 * @param req Request de Express con params: { id } y body con los campos a actualizar.
 * @param res Response de Express.
 * @returns Respuesta HTTP con la clínica actualizada o 404 si no existe.
 */
export async function updateClinic(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findOne({ where: { id, isActive: true } });

    if (!clinic) {
      return res.status(404).json({ message: "Clínica no encontrada" });
    }

    const { nit } = req.body;
    if (nit) {
      const duplicate = await Clinic.findOne({ where: { nit, id: { [Op.ne]: id } } });
      if (duplicate) {
        return res.status(409).json({ message: "Ya existe una clínica con el mismo NIT" });
      }
    }

    await clinic.update(req.body);
    return res.json(clinic);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar la clínica", error });
  }
}

/**
 * Elimina lógicamente una clínica (soft delete).
 * DELETE /api/clinics/:id
 * @param req Request de Express con params: { id }.
 * @param res Response de Express.
 * @returns Respuesta HTTP con mensaje de confirmación o 404 si no existe.
 */
export async function deleteClinic(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findOne({ where: { id, isActive: true } });

    if (!clinic) {
      return res.status(404).json({ message: "Clínica no encontrada" });
    }

    await clinic.update({ isActive: false });
    return res.json({ message: "Clínica eliminada lógicamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar la clínica", error });
  }
}
