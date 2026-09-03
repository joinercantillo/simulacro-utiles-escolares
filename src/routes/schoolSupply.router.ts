import { Router, type Request, type Response } from "express";
import SchoolSupply, { createSchoolSupplySchema, updateSchoolSupplySchema } from "../models/schoolSupply.model";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /school-supply:
 *   get:
 *     summary: Obtener todos los suministros escolares
 *     tags: [Suministros Escolares]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de suministros }
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const items = await SchoolSupply.findAll({ where: { isActive: true } });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener suministros escolares", error });
  }
});

/**
 * @swagger
 * /school-supply/{id}:
 *   get:
 *     summary: Obtener suministro por ID
 *     tags: [Suministros Escolares]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Suministro encontrado }
 *       404: { description: Suministro no encontrado }
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const item = await SchoolSupply.findOne({ where: { id: req.params.id, isActive: true } });
    if (!item) return res.status(404).json({ message: "Suministro escolar no encontrado" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el suministro escolar", error });
  }
});

/**
 * @swagger
 * /school-supply:
 *   post:
 *     summary: Crear suministro escolar (solo admin)
 *     tags: [Suministros Escolares]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category]
 *             properties:
 *               name: { type: string, example: "Cuaderno cuadriculado" }
 *               description: { type: string, example: "Cuaderno de 100 hojas" }
 *               category: { type: string, example: "Papelería" }
 *               unit: { type: string, example: "unidad" }
 *     responses:
 *       201: { description: Suministro creado }
 *       400: { description: Datos inválidos }
 *       409: { description: Nombre duplicado }
 */
router.post("/", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = createSchoolSupplySchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }

  try {
    const existing = await SchoolSupply.findOne({ where: { name: result.data.name } });
    if (existing) return res.status(409).json({ message: "Ya existe un suministro escolar con el mismo nombre" });

    const item = await SchoolSupply.create({
      ...result.data,
      description: result.data.description || "",
      unit: result.data.unit || "unidad",
    });
    res.status(201).json({ message: "Suministro escolar creado", item });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el suministro escolar", error });
  }
});

/**
 * @swagger
 * /school-supply/{id}:
 *   put:
 *     summary: Actualizar suministro escolar (solo admin)
 *     tags: [Suministros Escolares]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Suministro actualizado }
 *       400: { description: Datos inválidos }
 *       404: { description: Suministro no encontrado }
 */
router.put("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = updateSchoolSupplySchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }

  if (Object.keys(result.data).length === 0) {
    return res.status(400).json({ message: "Debe proporcionar al menos un campo para actualizar" });
  }

  try {
    const item = await SchoolSupply.findOne({ where: { id: req.params.id, isActive: true } });
    if (!item) return res.status(404).json({ message: "Suministro escolar no encontrado" });

    await item.update(result.data);
    res.json({ message: "Suministro escolar actualizado", item });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el suministro escolar", error });
  }
});

/**
 * @swagger
 * /school-supply/{id}:
 *   delete:
 *     summary: Eliminar suministro escolar (baja lógica, solo admin)
 *     tags: [Suministros Escolares]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Suministro eliminado }
 *       404: { description: Suministro no encontrado }
 */
router.delete("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const item = await SchoolSupply.findOne({ where: { id: req.params.id, isActive: true } });
    if (!item) return res.status(404).json({ message: "Suministro escolar no encontrado" });

    await item.update({ isActive: false });
    res.json({ message: "Suministro escolar eliminado lógicamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el suministro escolar", error });
  }
});

export default router;
