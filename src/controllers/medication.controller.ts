import { Request, Response } from "express";
import { Medication } from "../models";

export async function getAllMedications(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const medications = await Medication.findAll({ where: { isActive: true } });
    return res.json(medications);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener medicamentos", error });
  }
}

export async function getMedicationById(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const medication = await Medication.findOne({
      where: { id, isActive: true },
    });

    if (!medication) {
      return res.status(404).json({ message: "Medicamento no encontrado" });
    }

    return res.json(medication);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el medicamento", error });
  }
}

export async function createMedication(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { name, description, category, unit } = req.body;

    const existingMedication = await Medication.findOne({ where: { name } });
    if (existingMedication) {
      return res.status(409).json({ message: "Ya existe un medicamento con el mismo nombre" });
    }

    const medication = await Medication.create({
      name,
      description,
      category,
      unit: unit || "unidad",
    });

    return res.status(201).json(medication);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear el medicamento", error });
  }
}

export async function updateMedication(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const medication = await Medication.findOne({ where: { id, isActive: true } });

    if (!medication) {
      return res.status(404).json({ message: "Medicamento no encontrado" });
    }

    await medication.update(req.body);
    return res.json(medication);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar el medicamento", error });
  }
}

export async function deleteMedication(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const medication = await Medication.findOne({ where: { id, isActive: true } });

    if (!medication) {
      return res.status(404).json({ message: "Medicamento no encontrado" });
    }

    await medication.update({ isActive: false });
    return res.json({ message: "Medicamento eliminado lógicamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar el medicamento", error });
  }
}