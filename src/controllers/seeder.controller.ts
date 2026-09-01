import { Request, Response } from "express";
import fs from "fs";
import bcrypt from "bcryptjs";
import { Clinic, Inventory, Medication, SupplyRequest, Warehouse } from "../models";
import User from "../models/User";

async function seedUsers(users: any[]): Promise<void> {
  for (const user of users) {
    const existing = await User.findOne({ where: { email: user.email } });
    if (existing) continue;

    const hashedPassword = await bcrypt.hash(user.password || "123456", 10);
    await User.create({
      name: user.name,
      email: user.email,
      password: hashedPassword,
      role: user.role,
    });
  }
}

async function seedClinics(clinics: any[]): Promise<void> {
  for (const clinic of clinics) {
    const existing = await Clinic.findOne({ where: { nit: clinic.nit } });
    if (existing) continue;

    await Clinic.create({
      name: clinic.name,
      nit: clinic.nit,
      address: clinic.address,
      phone: clinic.phone,
      responsibleName: clinic.responsibleName,
      responsibleEmail: clinic.responsibleEmail,
    });
  }
}

async function seedWarehouses(warehouses: any[]): Promise<void> {
  for (const warehouse of warehouses) {
    const existing = await Warehouse.findOne({ where: { name: warehouse.name } });
    if (existing) continue;

    await Warehouse.create({
      name: warehouse.name,
      location: warehouse.location,
      responsibleName: warehouse.responsibleName,
      responsibleEmail: warehouse.responsibleEmail,
    });
  }
}

async function seedMedications(medications: any[]): Promise<void> {
  for (const medication of medications) {
    const existing = await Medication.findOne({ where: { name: medication.name } });
    if (existing) continue;

    await Medication.create({
      name: medication.name,
      description: medication.description,
      category: medication.category,
      unit: medication.unit || "unidad",
    });
  }
}

async function seedInventory(inventory: any[]): Promise<void> {
  for (const item of inventory) {
    const existing = await Inventory.findOne({
      where: { warehouseId: item.warehouseId, medicationId: item.medicationId },
    });
    if (existing) continue;

    await Inventory.create({
      warehouseId: item.warehouseId,
      medicationId: item.medicationId,
      quantity: item.quantity,
    });
  }
}

async function seedSupplyRequests(requests: any[]): Promise<void> {
  for (const request of requests) {
    const existing = await SupplyRequest.findOne({
      where: {
        clinicId: request.clinicId,
        medicationId: request.medicationId,
        warehouseId: request.warehouseId,
      },
    });
    if (existing) continue;

    await SupplyRequest.create({
      clinicId: request.clinicId,
      medicationId: request.medicationId,
      warehouseId: request.warehouseId,
      quantityRequested: request.quantityRequested,
      status: request.status || "pendiente",
      notes: request.notes,
    });
  }
}

export async function runSeeder(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Debes subir un archivo JSON" });
    }

    const rawData = fs.readFileSync(file.path, "utf-8");
    const data = JSON.parse(rawData);

    if (!Array.isArray(data)) {
      return res.status(400).json({ message: "El archivo debe contener un arreglo de entidades" });
    }

    const summaries: Record<string, number> = {};

    for (const entity of data) {
      if (entity.__type === "user" || (entity.email && entity.password && entity.role)) {
        await seedUsers([entity]);
        summaries.users = (summaries.users || 0) + 1;
      } else if (entity.__type === "clinic" || entity.nit) {
        await seedClinics([entity]);
        summaries.clinics = (summaries.clinics || 0) + 1;
      } else if (entity.__type === "warehouse" || entity.location) {
        await seedWarehouses([entity]);
        summaries.warehouses = (summaries.warehouses || 0) + 1;
      } else if (entity.__type === "medication" || entity.category) {
        await seedMedications([entity]);
        summaries.medications = (summaries.medications || 0) + 1;
      } else if (entity.__type === "inventory" || (entity.warehouseId && entity.medicationId && entity.quantity)) {
        await seedInventory([entity]);
        summaries.inventory = (summaries.inventory || 0) + 1;
      } else if (entity.__type === "request" || entity.quantityRequested) {
        await seedSupplyRequests([entity]);
        summaries.requests = (summaries.requests || 0) + 1;
      }
    }

    return res.status(201).json({
      message: "Seeders cargados exitosamente",
      seeders: summaries,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al cargar los seeders. Verifica que el JSON tenga el formato correcto",
      error,
    });
  }
}

export async function seedAllDefault(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    await seedUsers([
      { name: "Administrador Principal", email: "admin@riwimed.co", password: "admin123", role: "admin" },
      { name: "Gestora Principal", email: "gestor@riwimed.co", password: "gestor123", role: "gestor" },
    ]);
    await seedClinics([
      { name: "Clínica Vida Sana", nit: "900123456-1", address: "Calle 10 # 20-30", phone: "3001234567", responsibleName: "María López", responsibleEmail: "maria.lopez@vidasana.co" },
      { name: "Centro Médico Esperanza", nit: "900654321-8", address: "Av. 68 # 45-12", phone: "3119876543", responsibleName: "Carlos Pérez", responsibleEmail: "carlos.perez@centroesperanza.co" },
    ]);
    await seedWarehouses([
      { name: "Almacén Central", location: "Zona Industrial Norte Bodega 1", responsibleName: "Ana Torres", responsibleEmail: "ana.torres@riwimed.co" },
      { name: "Almacén Sur", location: "Carrera 30 # 12-85", responsibleName: "Jorge Ramírez", responsibleEmail: "jorge.ramirez@riwimed.co" },
    ]);
    await seedMedications([
      { name: "Acetaminofén", description: "Analgésico y antipirético", category: "Analgésicos", unit: "caja" },
      { name: "Ibuprofeno", description: "Antiinflamatorio no esteroideo", category: "Antiinflamatorios", unit: "caja" },
      { name: "Amoxicilina", description: "Antibiótico de amplio espectro", category: "Antibióticos", unit: "frasco" },
      { name: "Loratadina", description: "Antihistamínico", category: "Antialérgicos", unit: "caja" },
      { name: "Suero Oral", description: "Solución de rehidratación oral", category: "Hidratación", unit: "sobre" },
    ]);
    await seedInventory([
      { warehouseId: 1, medicationId: 1, quantity: 100 },
      { warehouseId: 1, medicationId: 2, quantity: 80 },
      { warehouseId: 1, medicationId: 3, quantity: 50 },
      { warehouseId: 2, medicationId: 4, quantity: 120 },
      { warehouseId: 2, medicationId: 5, quantity: 200 },
      { warehouseId: 2, medicationId: 1, quantity: 60 },
    ]);

    return res.status(201).json({ message: "Datos base cargados exitosamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al cargar datos base", error });
  }
}