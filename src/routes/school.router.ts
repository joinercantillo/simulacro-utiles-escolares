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
 *     summary: Obtener todas las instituciones
 *     tags: [Instituciones]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de instituciones }
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const schools = await School.findAll({ where: { isActive: true } });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener instituciones", error });
  }
});

/**
 * @swagger
 * /school/{id}:
 *   get:
 *     summary: Obtener institución por ID con su historial de solicitudes
 *     tags: [Instituciones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Institución encontrada }
 *       404: { description: Institución no encontrada }
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
    if (!school) return res.status(404).json({ message: "Institución no encontrada" });
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la institución", error });
  }
});

/**
 * @swagger
 * /school:
 *   post:
 *     summary: Crear una institución (solo admin)
 *     tags: [Instituciones]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, nit, address, phone, responsibleName, responsibleEmail]
 *             properties:
 *               name: { type: string, example: "Colegio La Esperanza" }
 *               nit: { type: string, example: "900123456-1" }
 *               address: { type: string, example: "Calle 10 # 20-30" }
 *               phone: { type: string, example: "3001234567" }
 *               responsibleName: { type: string, example: "María López" }
 *               responsibleEmail: { type: string, example: "maria.lopez@esperanza.co" }
 *     responses:
 *       201: { description: Institución creada }
 *       400: { description: Datos inválidos }
 *       409: { description: NIT duplicado }
 */
router.post("/", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = createSchoolSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }

  try {
    const existing = await School.findOne({ where: { nit: result.data.nit } });
    if (existing) return res.status(409).json({ message: "Ya existe una institución con el mismo NIT" });

    const school = await School.create(result.data);
    res.status(201).json({ message: "Institución creada", school });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la institución", error });
  }
});

/**
 * @swagger
 * /school/{id}:
 *   put:
 *     summary: Actualizar una institución (solo admin)
 *     tags: [Instituciones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Institución actualizada }
 *       400: { description: Datos inválidos }
 *       404: { description: Institución no encontrada }
 */
router.put("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = updateSchoolSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }

  if (Object.keys(result.data).length === 0) {
    return res.status(400).json({ message: "Debe proporcionar al menos un campo para actualizar" });
  }

  try {
    const school = await School.findOne({ where: { id: req.params.id, isActive: true } });
    if (!school) return res.status(404).json({ message: "Institución no encontrada" });

    if (result.data.nit) {
      const dup = await School.findOne({ where: { nit: result.data.nit, id: { [Op.ne]: req.params.id } } });
      if (dup) return res.status(409).json({ message: "Ya existe una institución con el mismo NIT" });
    }

    await school.update(result.data);
    res.json({ message: "Institución actualizada", school });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la institución", error });
  }
});

/**
 * @swagger
 * /school/{id}:
 *   delete:
 *     summary: Eliminar institución (baja lógica, solo admin)
 *     tags: [Instituciones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Institución eliminada }
 *       404: { description: Institución no encontrada }
 */
router.delete("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const school = await School.findOne({ where: { id: req.params.id, isActive: true } });
    if (!school) return res.status(404).json({ message: "Institución no encontrada" });

    await school.update({ isActive: false });
    res.json({ message: "Institución eliminada lógicamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la institución", error });
  }
});

export default router;
