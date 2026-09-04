import { Router, type Request, type Response } from "express";
import SchoolSupply, { createSchoolSupplySchema, updateSchoolSupplySchema } from "../models/schoolSupply.model";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /school-supply:
 *   get:
 *     summary: Get all school supplies
 *     tags: [School Supplies]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of supplies }
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const items = await SchoolSupply.findAll({ where: { isActive: true } });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error getting school supplies", error });
  }
});

/**
 * @swagger
 * /school-supply/{id}:
 *   get:
 *     summary: Get supply by ID
 *     tags: [School Supplies]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Supply found }
 *       404: { description: Supply not found }
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const item = await SchoolSupply.findOne({ where: { id: req.params.id, isActive: true } });
    if (!item) return res.status(404).json({ message: "School supply not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Error getting the school supply", error });
  }
});

/**
 * @swagger
 * /school-supply:
 *   post:
 *     summary: Create school supply (admin only)
 *     tags: [School Supplies]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category]
 *             properties:
 *               name: { type: string, example: "Graph paper notebook" }
 *               description: { type: string, example: "100-sheet notebook" }
 *               category: { type: string, example: "Stationery" }
 *               unit: { type: string, example: "unit" }
 *     responses:
 *       201: { description: Supply created }
 *       400: { description: Invalid data }
 *       409: { description: Duplicate name }
 */
router.post("/", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = createSchoolSupplySchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Invalid data", errors });
  }

  try {
    const existing = await SchoolSupply.findOne({ where: { name: result.data.name } });
    if (existing) return res.status(409).json({ message: "A school supply with the same name already exists" });

    const item = await SchoolSupply.create({
      ...result.data,
      description: result.data.description || "",
      unit: result.data.unit || "unidad",
    });
    res.status(201).json({ message: "School supply created", item });
  } catch (error) {
    res.status(500).json({ message: "Error creating the school supply", error });
  }
});

/**
 * @swagger
 * /school-supply/{id}:
 *   put:
 *     summary: Update school supply (admin only)
 *     tags: [School Supplies]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Supply updated }
 *       400: { description: Invalid data }
 *       404: { description: Supply not found }
 */
router.put("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = updateSchoolSupplySchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Invalid data", errors });
  }

  if (Object.keys(result.data).length === 0) {
    return res.status(400).json({ message: "You must provide at least one field to update" });
  }

  try {
    const item = await SchoolSupply.findOne({ where: { id: req.params.id, isActive: true } });
    if (!item) return res.status(404).json({ message: "School supply not found" });

    await item.update(result.data);
    res.json({ message: "School supply updated", item });
  } catch (error) {
    res.status(500).json({ message: "Error updating the school supply", error });
  }
});

/**
 * @swagger
 * /school-supply/{id}:
 *   delete:
 *     summary: Delete school supply (soft delete, admin only)
 *     tags: [School Supplies]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Supply deleted }
 *       404: { description: Supply not found }
 */
router.delete("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const item = await SchoolSupply.findOne({ where: { id: req.params.id, isActive: true } });
    if (!item) return res.status(404).json({ message: "School supply not found" });

    await item.update({ isActive: false });
    res.json({ message: "School supply soft deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting the school supply", error });
  }
});

export default router;
