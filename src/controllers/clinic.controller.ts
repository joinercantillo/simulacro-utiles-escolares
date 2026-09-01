import { Request, Response } from "express";
import { Op } from "sequelize";
import { Clinic, Medication, SupplyRequest, Warehouse } from "../models";

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
