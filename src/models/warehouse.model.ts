import { DataTypes, Model, Optional } from "sequelize";
import { z } from "zod";
import sequelize from "../config/database";

export interface IWarehouse {
  id: number;
  name: string;
  location: string;
  responsibleName: string;
  responsibleEmail: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WarehouseCreationAttributes = Optional<IWarehouse, "id" | "isActive" | "createdAt" | "updatedAt">;

class Warehouse extends Model<IWarehouse, WarehouseCreationAttributes> {
  public id!: number;
  public name!: string;
  public location!: string;
  public responsibleName!: string;
  public responsibleEmail!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Warehouse.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    location: { type: DataTypes.STRING(200), allowNull: false },
    responsibleName: { type: DataTypes.STRING(150), allowNull: false },
    responsibleEmail: { type: DataTypes.STRING(150), allowNull: false, validate: { isEmail: true } },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: "Warehouse", tableName: "warehouses" }
);

export default Warehouse;

export const createWarehouseSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  location: z.string().min(1, "Location is required").max(200),
  responsibleName: z.string().min(1, "Responsible name is required").max(150),
  responsibleEmail: z.string().email("Responsible email is not valid"),
});

export const updateWarehouseSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  location: z.string().min(1).max(200).optional(),
  responsibleName: z.string().min(1).max(150).optional(),
  responsibleEmail: z.string().email().optional(),
});
