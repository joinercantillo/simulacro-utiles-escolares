import dotenv from "dotenv";
import sequelize from "../config/database";
import "../models";
import bcrypt from "bcryptjs";
import { School, Inventory, SchoolSupply, SupplyRequest, Warehouse } from "../models";
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
      { name: "Administrador Principal", email: "admin@riwischool.co", password: await bcrypt.hash("admin123", 10), role: "admin" },
      { name: "Gestor de Solicitudes", email: "gestor@riwischool.co", password: await bcrypt.hash("gestor123", 10), role: "gestor" },
    ];
    await User.bulkCreate(users);
    console.log("Usuarios creados:", users.length);

    const schools = await School.bulkCreate([
      { name: "Colegio La Esperanza", nit: "900123456-1", address: "Calle 10 # 20-30", phone: "3001234567", responsibleName: "María López", responsibleEmail: "maria.lopez@esperanza.co" },
      { name: "Institución Educativa San José", nit: "900654321-8", address: "Av. 68 # 45-12", phone: "3119876543", responsibleName: "Carlos Pérez", responsibleEmail: "carlos.perez@sanjose.co" },
    ]);
    console.log("Instituciones creadas:", schools.length);

    const warehouses = await Warehouse.bulkCreate([
      { name: "Bodega Central", location: "Zona Industrial Norte Bodega 1", responsibleName: "Ana Torres", responsibleEmail: "ana.torres@riwischool.co" },
      { name: "Bodega Sur", location: "Carrera 30 # 12-85", responsibleName: "Jorge Ramírez", responsibleEmail: "jorge.ramirez@riwischool.co" },
    ]);
    console.log("Almacenes creados:", warehouses.length);

    const schoolSupplies = await SchoolSupply.bulkCreate([
      { name: "Cuaderno cuadriculado", description: "Cuaderno de 100 hojas tamaño carta", category: "Papelería", unit: "unidad" },
      { name: "Lápiz grafito HB", description: "Lápiz de grafito estándar con borrador", category: "Papelería", unit: "caja" },
      { name: "Resma de papel", description: "Resma de 500 hojas carta x75g", category: "Papelería", unit: "resma" },
      { name: "Colores x12", description: "Caja de 12 colores escolares", category: "Artes", unit: "caja" },
      { name: "Morral escolar", description: "Morral escolar con compartimientos", category: "Uniformes y accesorios", unit: "unidad" },
    ]);
    console.log("Suministros escolares creados:", schoolSupplies.length);

    await Inventory.bulkCreate([
      { warehouseId: 1, schoolSupplyId: 1, quantity: 100 },
      { warehouseId: 1, schoolSupplyId: 2, quantity: 80 },
      { warehouseId: 1, schoolSupplyId: 3, quantity: 50 },
      { warehouseId: 2, schoolSupplyId: 4, quantity: 120 },
      { warehouseId: 2, schoolSupplyId: 5, quantity: 200 },
      { warehouseId: 2, schoolSupplyId: 1, quantity: 60 },
    ]);
    console.log("Inventario creado");

    await SupplyRequest.bulkCreate([
      { schoolId: 1, schoolSupplyId: 1, warehouseId: 1, quantityRequested: 20, status: "aprobada", notes: "Reabastecimiento mensual" },
      { schoolId: 2, schoolSupplyId: 4, warehouseId: 2, quantityRequested: 15, status: "pendiente", notes: "Primera solicitud" },
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