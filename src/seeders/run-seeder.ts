import dotenv from "dotenv";
import sequelize from "../config/database";
import "../models";
import bcrypt from "bcryptjs";
import { Clinic, Inventory, Medication, SupplyRequest, Warehouse } from "../models";
import User from "../models/User";

dotenv.config();

/**
 * Ejecuta la carga de datos base en la base de datos, sincronizando los modelos y creando los registros iniciales.
 * @returns Promesa que se resuelve al terminar de insertar los datos.
 * @throws Si falla la conexión o la inserción, termina el proceso con código de error.
 */
async function seed(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Conectado a PostgreSQL");

    await sequelize.sync({ force: true });
    console.log("Base de datos sincronizada");

    const users = [
      { name: "Administrador Principal", email: "admin@riwimed.co", password: await bcrypt.hash("admin123", 10), role: "admin" },
      { name: "Gestor de Solicitudes", email: "gestor@riwimed.co", password: await bcrypt.hash("gestor123", 10), role: "gestor" },
    ];
    await User.bulkCreate(users);
    console.log("Usuarios creados:", users.length);

    const clinics = await Clinic.bulkCreate([
      { name: "Clínica Vida Sana", nit: "900123456-1", address: "Calle 10 # 20-30", phone: "3001234567", responsibleName: "María López", responsibleEmail: "maria.lopez@vidasana.co" },
      { name: "Centro Médico Esperanza", nit: "900654321-8", address: "Av. 68 # 45-12", phone: "3119876543", responsibleName: "Carlos Pérez", responsibleEmail: "carlos.perez@centroesperanza.co" },
    ]);
    console.log("Clínicas creadas:", clinics.length);

    const warehouses = await Warehouse.bulkCreate([
      { name: "Almacén Central", location: "Zona Industrial Norte Bodega 1", responsibleName: "Ana Torres", responsibleEmail: "ana.torres@riwimed.co" },
      { name: "Almacén Sur", location: "Carrera 30 # 12-85", responsibleName: "Jorge Ramírez", responsibleEmail: "jorge.ramirez@riwimed.co" },
    ]);
    console.log("Almacenes creados:", warehouses.length);

    const medications = await Medication.bulkCreate([
      { name: "Acetaminofén", description: "Analgésico y antipirético", category: "Analgésicos", unit: "caja" },
      { name: "Ibuprofeno", description: "Antiinflamatorio no esteroideo", category: "Antiinflamatorios", unit: "caja" },
      { name: "Amoxicilina", description: "Antibiótico de amplio espectro", category: "Antibióticos", unit: "frasco" },
      { name: "Loratadina", description: "Antihistamínico", category: "Antialérgicos", unit: "caja" },
      { name: "Suero Oral", description: "Solución de rehidratación oral", category: "Hidratación", unit: "sobre" },
    ]);
    console.log("Medicamentos creados:", medications.length);

    await Inventory.bulkCreate([
      { warehouseId: 1, medicationId: 1, quantity: 100 },
      { warehouseId: 1, medicationId: 2, quantity: 80 },
      { warehouseId: 1, medicationId: 3, quantity: 50 },
      { warehouseId: 2, medicationId: 4, quantity: 120 },
      { warehouseId: 2, medicationId: 5, quantity: 200 },
      { warehouseId: 2, medicationId: 1, quantity: 60 },
    ]);
    console.log("Inventario creado");

    await SupplyRequest.bulkCreate([
      { clinicId: 1, medicationId: 1, warehouseId: 1, quantityRequested: 20, status: "aprobada", notes: "Reabastecimiento mensual" },
      { clinicId: 2, medicationId: 4, warehouseId: 2, quantityRequested: 15, status: "pendiente", notes: "Primera solicitud" },
    ]);
    console.log("Solicitudes creadas");

    console.log("Seeders ejecutados correctamente ✔");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("Error ejecutando seeders:", error);
    process.exit(1);
  }
}

seed();