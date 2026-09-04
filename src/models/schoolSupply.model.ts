import { DataTypes, Model, Optional } from "sequelize";
import { z } from "zod";
import sequelize from "../config/database";

export interface ISchoolSupply {
  id: number;
  name: string;
  description: string;
  category: string;
  unit: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SchoolSupplyCreationAttributes = Optional<ISchoolSupply, "id" | "isActive" | "createdAt" | "updatedAt">;

class SchoolSupply extends Model<ISchoolSupply, SchoolSupplyCreationAttributes> {
  public id!: number;
  public name!: string;
  public description!: string;
  public category!: string;
  public unit!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SchoolSupply.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    category: { type: DataTypes.STRING(100), allowNull: false },
    unit: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "unidad" },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: "SchoolSupply", tableName: "school_supplies" }
);

export default SchoolSupply;

export const createSchoolSupplySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(150),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required").max(100),
  unit: z.string().min(1).max(50).optional(),
});

export const updateSchoolSupplySchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
  category: z.string().min(1).max(100).optional(),
  unit: z.string().min(1).max(50).optional(),
});
