import { Router, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { School, Inventory, SchoolSupply, SupplyRequest, Warehouse } from "../models";
import User from "../models/user.model";
import { authenticateToken } from "../middlewares/auth";

const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/json" || file.originalname.endsWith(".json")) {
      cb(null, true);
    } else {
      cb(new Error("Only JSON files are allowed") as any);
    }
  },
});

interface ISeedUser { name: string; email: string; password: string; role: string; }
interface ISeedSchool { name: string; nit: string; address: string; phone: string; responsibleName: string; responsibleEmail: string; }
interface ISeedWarehouse { name: string; location: string; responsibleName: string; responsibleEmail: string; }
interface ISeedSchoolSupply { name: string; description: string; category: string; unit?: string; }
interface ISeedInventory { warehouseId: number; schoolSupplyId: number; quantity: number; }
interface ISeedSupplyRequest { schoolId: number; schoolSupplyId: number; warehouseId: number; quantityRequested: number; status?: string; notes?: string; }

async function seedUsers(users: ISeedUser[]): Promise<void> {
  for (const user of users) {
    const existing = await User.findOne({ where: { email: user.email } });
    if (existing) continue;
    const hashedPassword = await bcrypt.hash(user.password || "123456", 10);
    await User.create({ name: user.name, email: user.email, password: hashedPassword, role: user.role as any });
  }
}

async function seedSchools(schools: ISeedSchool[]): Promise<void> {
  for (const school of schools) {
    const existing = await School.findOne({ where: { nit: school.nit } });
    if (existing) continue;
    await School.create(school);
  }
}

async function seedWarehouses(warehouses: ISeedWarehouse[]): Promise<void> {
  for (const warehouse of warehouses) {
    const existing = await Warehouse.findOne({ where: { name: warehouse.name } });
    if (existing) continue;
    await Warehouse.create(warehouse);
  }
}

async function seedSchoolSupplies(supplies: ISeedSchoolSupply[]): Promise<void> {
  for (const supply of supplies) {
    const existing = await SchoolSupply.findOne({ where: { name: supply.name } });
    if (existing) continue;
    await SchoolSupply.create({ ...supply, unit: supply.unit || "unidad" });
  }
}

async function seedInventory(inventory: ISeedInventory[]): Promise<void> {
  for (const item of inventory) {
    const existing = await Inventory.findOne({ where: { warehouseId: item.warehouseId, schoolSupplyId: item.schoolSupplyId } });
    if (existing) continue;
    await Inventory.create(item);
  }
}

async function seedSupplyRequests(requests: ISeedSupplyRequest[]): Promise<void> {
  for (const request of requests) {
    const existing = await SupplyRequest.findOne({ where: { schoolId: request.schoolId, schoolSupplyId: request.schoolSupplyId, warehouseId: request.warehouseId } });
    if (existing) continue;
    await SupplyRequest.create({ ...request, status: (request.status || "pendiente") as any, notes: request.notes || "" });
  }
}

const router = Router();

/** @swagger
 * tags:
 *   name: Seeders
 *   description: Loading default data via JSON files
 */

/**
 * @swagger
 * /seeder/upload:
 *   post:
 *     summary: Load default data from a JSON file
 *     tags: [Seeders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: Data loaded }
 *       400: { description: Invalid file }
 */
router.post("/upload", authenticateToken, upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "You must upload a JSON file" });

    const rawData = fs.readFileSync(file.path, "utf-8");
    const data = JSON.parse(rawData);

    if (!Array.isArray(data)) return res.status(400).json({ message: "The file must contain an array of entities" });

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

    return res.status(201).json({ message: "Seeders loaded successfully", seeders: summaries });
  } catch (error) {
    return res.status(500).json({ message: "Error loading seeders. Verify the JSON has the correct format", error });
  }
});

/**
 * @swagger
 * /seeder/default:
 *   post:
 *     summary: Load default data
 *     tags: [Seeders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Default data loaded }
 */
router.post("/default", authenticateToken, async (_req: Request, res: Response) => {
  try {
    await seedUsers([
      { name: "Main Administrator", email: "admin@riwischool.co", password: "admin123", role: "admin" },
      { name: "Main Manager", email: "gestor@riwischool.co", password: "gestor123", role: "gestor" },
    ]);
    await seedSchools([
      { name: "Hope School", nit: "900123456-1", address: "Calle 10 # 20-30", phone: "3001234567", responsibleName: "María López", responsibleEmail: "maria.lopez@esperanza.co" },
      { name: "San Jose Educational Institution", nit: "900654321-8", address: "Av. 68 # 45-12", phone: "3119876543", responsibleName: "Carlos Pérez", responsibleEmail: "carlos.perez@sanjose.co" },
    ]);
    await seedWarehouses([
      { name: "Central Warehouse", location: "North Industrial Zone Warehouse 1", responsibleName: "Ana Torres", responsibleEmail: "ana.torres@riwischool.co" },
      { name: "South Warehouse", location: "Carrera 30 # 12-85", responsibleName: "Jorge Ramírez", responsibleEmail: "jorge.ramirez@riwischool.co" },
    ]);
    await seedSchoolSupplies([
      { name: "Graph paper notebook", description: "100-sheet letter-size notebook", category: "Stationery", unit: "unit" },
      { name: "HB graphite pencil", description: "Standard graphite pencil with eraser", category: "Stationery", unit: "box" },
      { name: "Paper ream", description: "500-sheet letter-size ream, 75g", category: "Stationery", unit: "ream" },
      { name: "Colored pencils x12", description: "Box of 12 school colored pencils", category: "Arts", unit: "box" },
      { name: "School backpack", description: "School backpack with compartments", category: "Uniforms and accessories", unit: "unit" },
    ]);
    await seedInventory([
      { warehouseId: 1, schoolSupplyId: 1, quantity: 100 },
      { warehouseId: 1, schoolSupplyId: 2, quantity: 80 },
      { warehouseId: 1, schoolSupplyId: 3, quantity: 50 },
      { warehouseId: 2, schoolSupplyId: 4, quantity: 120 },
      { warehouseId: 2, schoolSupplyId: 5, quantity: 200 },
      { warehouseId: 2, schoolSupplyId: 1, quantity: 60 },
    ]);

    return res.status(201).json({ message: "Default data loaded successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error loading default data", error });
  }
});

export default router;
