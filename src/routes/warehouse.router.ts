import { Router, type Request, type Response } from "express";
import Warehouse, { createWarehouseSchema, updateWarehouseSchema } from "../models/warehouse.model";
import { Inventory, SchoolSupply } from "../models";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /warehouse:
 *   get:
 *     summary: Get all warehouses
 *     tags: [Warehouses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of warehouses }
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const warehouses = await Warehouse.findAll({
      where: { isActive: true },
      include: [{ model: Inventory, as: "inventories", include: [{ model: SchoolSupply, as: "schoolSupply" }] }],
    });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: "Error getting warehouses", error });
  }
});

/**
 * @swagger
 * /warehouse/{id}:
 *   get:
 *     summary: Get warehouse by ID with its inventory
 *     tags: [Warehouses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Warehouse found }
 *       404: { description: Warehouse not found }
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const warehouse = await Warehouse.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{ model: Inventory, as: "inventories", include: [{ model: SchoolSupply, as: "schoolSupply" }] }],
    });
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ message: "Error getting the warehouse", error });
  }
});

/**
 * @swagger
 * /warehouse:
 *   post:
 *     summary: Create warehouse (admin only)
 *     tags: [Warehouses]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location, responsibleName, responsibleEmail]
 *             properties:
 *               name: { type: string, example: "Central Warehouse" }
 *               location: { type: string, example: "Zona Industrial Norte" }
 *               responsibleName: { type: string, example: "Ana Torres" }
 *               responsibleEmail: { type: string, example: "ana@riwischool.co" }
 *     responses:
 *       201: { description: Warehouse created }
 *       400: { description: Invalid data }
 */
router.post("/", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = createWarehouseSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Invalid data", errors });
  }

  try {
    const warehouse = await Warehouse.create(result.data);
    res.status(201).json({ message: "Warehouse created", warehouse });
  } catch (error) {
    res.status(500).json({ message: "Error creating the warehouse", error });
  }
});

/**
 * @swagger
 * /warehouse/{id}:
 *   put:
 *     summary: Update warehouse (admin only)
 *     tags: [Warehouses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Warehouse updated }
 *       400: { description: Invalid data }
 *       404: { description: Warehouse not found }
 */
router.put("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = updateWarehouseSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Invalid data", errors });
  }

  if (Object.keys(result.data).length === 0) {
    return res.status(400).json({ message: "You must provide at least one field to update" });
  }

  try {
    const warehouse = await Warehouse.findOne({ where: { id: req.params.id, isActive: true } });
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });

    await warehouse.update(result.data);
    res.json({ message: "Warehouse updated", warehouse });
  } catch (error) {
    res.status(500).json({ message: "Error updating the warehouse", error });
  }
});

/**
 * @swagger
 * /warehouse/{id}:
 *   delete:
 *     summary: Delete warehouse (soft delete, admin only)
 *     tags: [Warehouses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Warehouse deleted }
 *       404: { description: Warehouse not found }
 */
router.delete("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const warehouse = await Warehouse.findOne({ where: { id: req.params.id, isActive: true } });
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });

    await warehouse.update({ isActive: false });
    res.json({ message: "Warehouse soft deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting the warehouse", error });
  }
});

export default router;
