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
 *     summary: Obtener inventario de un almacén
 *     tags: [Inventario]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de inventario }
 */
router.get("/warehouse/:warehouseId", async (req: Request, res: Response) => {
  try {
    const inventory = await Inventory.findAll({
      where: { warehouseId: req.params.warehouseId },
      include: [{ model: SchoolSupply, as: "schoolSupply" }],
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener inventario", error });
  }
});

/**
 * @swagger
 * /inventory:
 *   post:
 *     summary: Agregar stock de suministro (solo admin)
 *     tags: [Inventario]
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
 *       201: { description: Inventario creado }
 *       400: { description: Datos inválidos }
 *       404: { description: Almacén o suministro no encontrado }
 */
router.post("/", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = createInventorySchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }

  try {
    const { warehouseId, schoolSupplyId, quantity } = result.data;

    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) return res.status(404).json({ message: "Almacén no encontrado" });

    const supply = await SchoolSupply.findOne({ where: { id: schoolSupplyId, isActive: true } });
    if (!supply) return res.status(404).json({ message: "Suministro escolar no encontrado" });

    const existing = await Inventory.findOne({ where: { warehouseId, schoolSupplyId } });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json({ message: "Inventario actualizado", inventory: existing });
    }

    const inventory = await Inventory.create({ warehouseId, schoolSupplyId, quantity });
    res.status(201).json({ message: "Inventario creado", inventory });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar inventario", error });
  }
});

/**
 * @swagger
 * /inventory/{id}:
 *   put:
 *     summary: Actualizar cantidad de inventario (solo admin)
 *     tags: [Inventario]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Inventario actualizado }
 *       400: { description: Datos inválidos }
 *       404: { description: Registro no encontrado }
 */
router.put("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = updateInventorySchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }

  try {
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) return res.status(404).json({ message: "Registro de inventario no encontrado" });

    await inventory.update(result.data);
    res.json({ message: "Inventario actualizado", inventory });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar inventario", error });
  }
});

export default router;
