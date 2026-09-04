import { Router, type Request, type Response } from "express";
import Inventory, { createInventorySchema, updateInventorySchema } from "../models/inventory.model";
import { Warehouse, SchoolSupply } from "../models";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /inventory/warehouse/{warehouseId}:
 *   get:
 *     summary: Get the inventory of a warehouse
 *     tags: [Inventory]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Inventory list }
 */
router.get("/warehouse/:warehouseId", async (req: Request, res: Response) => {
  try {
    const inventory = await Inventory.findAll({
      where: { warehouseId: req.params.warehouseId },
      include: [{ model: SchoolSupply, as: "schoolSupply" }],
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Error getting inventory", error });
  }
});

/**
 * @swagger
 * /inventory:
 *   post:
 *     summary: Add supply stock (admin only)
 *     tags: [Inventory]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [warehouseId, schoolSupplyId, quantity]
 *             properties:
 *               warehouseId: { type: integer, example: 1 }
 *               schoolSupplyId: { type: integer, example: 1 }
 *               quantity: { type: integer, example: 100 }
 *     responses:
 *       201: { description: Inventory created }
 *       400: { description: Invalid data }
 *       404: { description: Warehouse or supply not found }
 */
router.post("/", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = createInventorySchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Invalid data", errors });
  }

  try {
    const { warehouseId, schoolSupplyId, quantity } = result.data;

    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });

    const supply = await SchoolSupply.findOne({ where: { id: schoolSupplyId, isActive: true } });
    if (!supply) return res.status(404).json({ message: "School supply not found" });

    const existing = await Inventory.findOne({ where: { warehouseId, schoolSupplyId } });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json({ message: "Inventory updated", inventory: existing });
    }

    const inventory = await Inventory.create({ warehouseId, schoolSupplyId, quantity });
    res.status(201).json({ message: "Inventory created", inventory });
  } catch (error) {
    res.status(500).json({ message: "Error adding inventory", error });
  }
});

/**
 * @swagger
 * /inventory/{id}:
 *   put:
 *     summary: Update inventory quantity (admin only)
 *     tags: [Inventory]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Inventory updated }
 *       400: { description: Invalid data }
 *       404: { description: Inventory record not found }
 */
router.put("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = updateInventorySchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Invalid data", errors });
  }

  try {
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) return res.status(404).json({ message: "Inventory record not found" });

    await inventory.update(result.data);
    res.json({ message: "Inventory updated", inventory });
  } catch (error) {
    res.status(500).json({ message: "Error updating inventory", error });
  }
});

export default router;
