import { DataTypes, Model, Optional } from "sequelize";
import { z } from "zod";
import sequelize from "../config/database";

export interface IInventory {
  id: number;
  warehouseId: number;
  schoolSupplyId: number;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type InventoryCreationAttributes = Optional<IInventory, "id" | "createdAt" | "updatedAt">;

class Inventory extends Model<IInventory, InventoryCreationAttributes> {
  public id!: number;
  public warehouseId!: number;
  public schoolSupplyId!: number;
  public quantity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Inventory.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    warehouseId: { type: DataTypes.INTEGER, allowNull: false },
    schoolSupplyId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  },
  { sequelize, modelName: "Inventory", tableName: "inventories" }
);

export default Inventory;

export const createInventorySchema = z.object({
  warehouseId: z.number().int().positive("El ID del almacén es requerido"),
  schoolSupplyId: z.number().int().positive("El ID del suministro es requerido"),
  quantity: z.number().int().min(0, "La cantidad no puede ser negativa"),
});

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0, "La cantidad no puede ser negativa").optional(),
});
