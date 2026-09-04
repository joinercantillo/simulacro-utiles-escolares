import { Router, type Request, type Response } from "express";
import { Op } from "sequelize";
import School, { createSchoolSchema, updateSchoolSchema } from "../models/school.model";
import { SchoolSupply, SupplyRequest, Warehouse } from "../models";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /school:
 *   get:
 *     summary: Get all schools
 *     tags: [Schools]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of schools }
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const schools = await School.findAll({ where: { isActive: true } });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: "Error getting schools", error });
  }
});

/**
 * @swagger
 * /school/{id}:
 *   get:
 *     summary: Get school by ID with its request history
 *     tags: [Schools]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: School found }
 *       404: { description: School not found }
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const school = await School.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{
        model: SupplyRequest,
        as: "requests",
        include: [
          { model: SchoolSupply, as: "schoolSupply" },
          { model: Warehouse, as: "warehouse" },
        ],
      }],
    });
    if (!school) return res.status(404).json({ message: "School not found" });
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: "Error getting the school", error });
  }
});

/**
 * @swagger
 * /school:
 *   post:
 *     summary: Create a school (admin only)
 *     tags: [Schools]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, nit, address, phone, responsibleName, responsibleEmail]
 *             properties:
 *               name: { type: string, example: "Hope School" }
 *               nit: { type: string, example: "900123456-1" }
 *               address: { type: string, example: "Calle 10 # 20-30" }
 *               phone: { type: string, example: "3001234567" }
 *               responsibleName: { type: string, example: "María López" }
 *               responsibleEmail: { type: string, example: "maria.lopez@esperanza.co" }
 *     responses:
 *       201: { description: School created }
 *       400: { description: Invalid data }
 *       409: { description: Duplicate NIT }
 */
router.post("/", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = createSchoolSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Invalid data", errors });
  }

  try {
    const existing = await School.findOne({ where: { nit: result.data.nit } });
    if (existing) return res.status(409).json({ message: "A school with the same NIT already exists" });

    const school = await School.create(result.data);
    res.status(201).json({ message: "School created", school });
  } catch (error) {
    res.status(500).json({ message: "Error creating the school", error });
  }
});

/**
 * @swagger
 * /school/{id}:
 *   put:
 *     summary: Update a school (admin only)
 *     tags: [Schools]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: School updated }
 *       400: { description: Invalid data }
 *       404: { description: School not found }
 */
router.put("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = updateSchoolSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Invalid data", errors });
  }

  if (Object.keys(result.data).length === 0) {
    return res.status(400).json({ message: "You must provide at least one field to update" });
  }

  try {
    const school = await School.findOne({ where: { id: req.params.id, isActive: true } });
    if (!school) return res.status(404).json({ message: "School not found" });

    if (result.data.nit) {
      const dup = await School.findOne({ where: { nit: result.data.nit, id: { [Op.ne]: req.params.id } } });
      if (dup) return res.status(409).json({ message: "A school with the same NIT already exists" });
    }

    await school.update(result.data);
    res.json({ message: "School updated", school });
  } catch (error) {
    res.status(500).json({ message: "Error updating the school", error });
  }
});

/**
 * @swagger
 * /school/{id}:
 *   delete:
 *     summary: Delete school (soft delete, admin only)
 *     tags: [Schools]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: School deleted }
 *       404: { description: School not found }
 */
router.delete("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const school = await School.findOne({ where: { id: req.params.id, isActive: true } });
    if (!school) return res.status(404).json({ message: "School not found" });

    await school.update({ isActive: false });
    res.json({ message: "School soft deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting the school", error });
  }
});

export default router;
