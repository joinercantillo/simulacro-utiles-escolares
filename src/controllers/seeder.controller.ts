import { Request, Response } from "express";
import fs from "fs";
import bcrypt from "bcryptjs";
import { School, Inventory, SchoolSupply, SupplyRequest, Warehouse } from "../models";
import User from "../models/User";

/**
 * Crea usuarios en la base de datos si no existen previamente por email.
 * @param users Arreglo de usuarios a insertar.
 * @returns Promesa que se resuelve al terminar de insertar.
 */
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

/**
 * Crea instituciones en la base de datos si no existen previamente por NIT.
 * @param schools Arreglo de instituciones a insertar.
 * @returns Promesa que se resuelve al terminar de insertar.
 */
async function seedSchools(schools: any[]): Promise<void> {
  for (const school of schools) {
    const existing = await School.findOne({ where: { nit: school.nit } });
    if (existing) continue;

    await School.create({
      name: school.name,
      nit: school.nit,
      address: school.address,
      phone: school.phone,
      responsibleName: school.responsibleName,
      responsibleEmail: school.responsibleEmail,
    });
  }
}

/**
 * Crea almacenes en la base de datos si no existen previamente por nombre.
 * @param warehouses Arreglo de almacenes a insertar.
 * @returns Promesa que se resuelve al terminar de insertar.
 */
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

/**
 * Crea suministros escolares en la base de datos si no existen previamente por nombre.
 * @param schoolSupplies Arreglo de suministros escolares a insertar.
 * @returns Promesa que se resuelve al terminar de insertar.
 */
async function seedSchoolSupplies(schoolSupplies: any[]): Promise<void> {
  for (const schoolSupply of schoolSupplies) {
    const existing = await SchoolSupply.findOne({ where: { name: schoolSupply.name } });
    if (existing) continue;

    await SchoolSupply.create({
      name: schoolSupply.name,
      description: schoolSupply.description,
      category: schoolSupply.category,
      unit: schoolSupply.unit || "unidad",
    });
  }
}

/**
 * Crea registros de inventario en la base de datos si no existen previamente para el mismo almacén y suministro escolar.
 * @param inventory Arreglo de registros de inventario a insertar.
 * @returns Promesa que se resuelve al terminar de insertar.
 */
async function seedInventory(inventory: any[]): Promise<void> {
  for (const item of inventory) {
    const existing = await Inventory.findOne({
      where: { warehouseId: item.warehouseId, schoolSupplyId: item.schoolSupplyId },
    });
    if (existing) continue;

    await Inventory.create({
      warehouseId: item.warehouseId,
      schoolSupplyId: item.schoolSupplyId,
      quantity: item.quantity,
    });
  }
}

/**
 * Crea solicitudes de suministro en la base de datos si no existen previamente con la misma combinación de institución, suministro escolar y almacén.
 * @param requests Arreglo de solicitudes de suministro a insertar.
 * @returns Promesa que se resuelve al terminar de insertar.
 */
async function seedSupplyRequests(requests: any[]): Promise<void> {
  for (const request of requests) {
    const existing = await SupplyRequest.findOne({
      where: {
        schoolId: request.schoolId,
        schoolSupplyId: request.schoolSupplyId,
        warehouseId: request.warehouseId,
      },
    });
    if (existing) continue;

    await SupplyRequest.create({
      schoolId: request.schoolId,
      schoolSupplyId: request.schoolSupplyId,
      warehouseId: request.warehouseId,
      quantityRequested: request.quantityRequested,
      status: request.status || "pendiente",
      notes: request.notes,
    });
  }
}

/**
 * Carga la información de entidades a partir de un archivo JSON subido al sistema.
 * Clasifica cada entidad del arreglo y la inserta a través de los helpers de seed correspondientes.
 * POST /api/seeders
 * @param req Request de Express con el archivo JSON en file.
 * @param res Response de Express.
 * @returns Respuesta HTTP con un resumen de las entidades cargadas.
 */
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
      } else if (entity.__type === "school" || entity.nit) {
        await seedSchools([entity]);
        summaries.schools = (summaries.schools || 0) + 1;
      } else if (entity.__type === "warehouse" || entity.location) {
        await seedWarehouses([entity]);
        summaries.warehouses = (summaries.warehouses || 0) + 1;
      } else if (entity.__type === "schoolSupply" || entity.category) {
        await seedSchoolSupplies([entity]);
        summaries.schoolSupplies = (summaries.schoolSupplies || 0) + 1;
      } else if (entity.__type === "inventory" || (entity.warehouseId && entity.schoolSupplyId && entity.quantity)) {
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

/**
 * Carga los datos base por defecto del sistema: usuarios, instituciones, almacenes, suministros escolares e inventario.
 * POST /api/seeders/default
 * @param req Request de Express.
 * @param res Response de Express.
 * @returns Respuesta HTTP que confirma la carga de los datos base.
 */
export async function seedAllDefault(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    await seedUsers([
      { name: "Administrador Principal", email: "admin@riwischool.co", password: "admin123", role: "admin" },
      { name: "Gestora Principal", email: "gestor@riwischool.co", password: "gestor123", role: "gestor" },
    ]);
    await seedSchools([
      { name: "Colegio La Esperanza", nit: "900123456-1", address: "Calle 10 # 20-30", phone: "3001234567", responsibleName: "María López", responsibleEmail: "maria.lopez@esperanza.co" },
      { name: "Institución Educativa San José", nit: "900654321-8", address: "Av. 68 # 45-12", phone: "3119876543", responsibleName: "Carlos Pérez", responsibleEmail: "carlos.perez@sanjose.co" },
    ]);
    await seedWarehouses([
      { name: "Bodega Central", location: "Zona Industrial Norte Bodega 1", responsibleName: "Ana Torres", responsibleEmail: "ana.torres@riwischool.co" },
      { name: "Bodega Sur", location: "Carrera 30 # 12-85", responsibleName: "Jorge Ramírez", responsibleEmail: "jorge.ramirez@riwischool.co" },
    ]);
    await seedSchoolSupplies([
      { name: "Cuaderno cuadriculado", description: "Cuaderno de 100 hojas tamaño carta", category: "Papelería", unit: "unidad" },
      { name: "Lápiz grafito HB", description: "Lápiz de grafito estándar con borrador", category: "Papelería", unit: "caja" },
      { name: "Resma de papel", description: "Resma de 500 hojas carta x75g", category: "Papelería", unit: "resma" },
      { name: "Colores x12", description: "Caja de 12 colores escolares", category: "Artes", unit: "caja" },
      { name: "Morral escolar", description: "Morral escolar con compartimientos", category: "Uniformes y accesorios", unit: "unidad" },
    ]);
    await seedInventory([
      { warehouseId: 1, schoolSupplyId: 1, quantity: 100 },
      { warehouseId: 1, schoolSupplyId: 2, quantity: 80 },
      { warehouseId: 1, schoolSupplyId: 3, quantity: 50 },
      { warehouseId: 2, schoolSupplyId: 4, quantity: 120 },
      { warehouseId: 2, schoolSupplyId: 5, quantity: 200 },
      { warehouseId: 2, schoolSupplyId: 1, quantity: 60 },
    ]);

    return res.status(201).json({ message: "Datos base cargados exitosamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al cargar datos base", error });
  }
}