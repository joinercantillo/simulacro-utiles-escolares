import dotenv from "dotenv";
import sequelize from "../config/database";
import "../models";
import bcrypt from "bcryptjs";
import { School, Inventory, SchoolSupply, SupplyRequest, Warehouse } from "../models";
import User from "../models/user.model";
import { UserRole } from "../types";
import { RequestStatus } from "../types";

dotenv.config();

/**
 * Runs the default data load into the database, synchronizing the models and creating the initial records.
 * @returns Promise that resolves once the data has been inserted.
 * @throws If the connection or insertion fails, terminates the process with an error code.
 */
async function seed(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL");

    await sequelize.sync({ force: true });
    console.log("Database synchronized");

    const users = [
      { name: "Main Administrator", email: "admin@riwischool.co", password: await bcrypt.hash("admin123", 10), role: UserRole.ADMIN },
      { name: "Requests Manager", email: "gestor@riwischool.co", password: await bcrypt.hash("gestor123", 10), role: UserRole.GESTOR },
    ];
    await User.bulkCreate(users);
    console.log("Users created:", users.length);

    const schools = await School.bulkCreate([
      { name: "Hope School", nit: "900123456-1", address: "Calle 10 # 20-30", phone: "3001234567", responsibleName: "María López", responsibleEmail: "maria.lopez@esperanza.co" },
      { name: "San Jose Educational Institution", nit: "900654321-8", address: "Av. 68 # 45-12", phone: "3119876543", responsibleName: "Carlos Pérez", responsibleEmail: "carlos.perez@sanjose.co" },
    ]);
    console.log("Schools created:", schools.length);

    const warehouses = await Warehouse.bulkCreate([
      { name: "Central Warehouse", location: "North Industrial Zone Warehouse 1", responsibleName: "Ana Torres", responsibleEmail: "ana.torres@riwischool.co" },
      { name: "South Warehouse", location: "Carrera 30 # 12-85", responsibleName: "Jorge Ramírez", responsibleEmail: "jorge.ramirez@riwischool.co" },
    ]);
    console.log("Warehouses created:", warehouses.length);

    const schoolSupplies = await SchoolSupply.bulkCreate([
      { name: "Graph paper notebook", description: "100-sheet letter-size notebook", category: "Stationery", unit: "unit" },
      { name: "HB graphite pencil", description: "Standard graphite pencil with eraser", category: "Stationery", unit: "box" },
      { name: "Paper ream", description: "500-sheet letter-size ream, 75g", category: "Stationery", unit: "ream" },
      { name: "Colored pencils x12", description: "Box of 12 school colored pencils", category: "Arts", unit: "box" },
      { name: "School backpack", description: "School backpack with compartments", category: "Uniforms and accessories", unit: "unit" },
    ]);
    console.log("School supplies created:", schoolSupplies.length);

    await Inventory.bulkCreate([
      { warehouseId: 1, schoolSupplyId: 1, quantity: 100 },
      { warehouseId: 1, schoolSupplyId: 2, quantity: 80 },
      { warehouseId: 1, schoolSupplyId: 3, quantity: 50 },
      { warehouseId: 2, schoolSupplyId: 4, quantity: 120 },
      { warehouseId: 2, schoolSupplyId: 5, quantity: 200 },
      { warehouseId: 2, schoolSupplyId: 1, quantity: 60 },
    ]);
    console.log("Inventory created");

    await SupplyRequest.bulkCreate([
      { schoolId: 1, schoolSupplyId: 1, warehouseId: 1, quantityRequested: 20, status: RequestStatus.APROBADA, notes: "Monthly restock" },
      { schoolId: 2, schoolSupplyId: 4, warehouseId: 2, quantityRequested: 15, status: RequestStatus.PENDIENTE, notes: "First request" },
    ]);
    console.log("Requests created");

    console.log("Seeders run successfully ✔");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("Error running seeders:", error);
    process.exit(1);
  }
}

seed();