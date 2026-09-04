import { DataTypes, Model, Optional } from "sequelize";
import { z } from "zod";
import sequelize from "../config/database";
import { RequestStatus } from "../types";

export interface ISupplyRequest {
  id: number;
  schoolId: number;
  schoolSupplyId: number;
  warehouseId: number;
  quantityRequested: number;
  status: RequestStatus;
  notes: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SupplyRequestCreationAttributes = Optional<ISupplyRequest, "id" | "isActive" | "createdAt" | "updatedAt">;

class SupplyRequest extends Model<ISupplyRequest, SupplyRequestCreationAttributes> {
  public id!: number;
  public schoolId!: number;
  public schoolSupplyId!: number;
  public warehouseId!: number;
  public quantityRequested!: number;
  public status!: RequestStatus;
  public notes!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SupplyRequest.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    schoolId: { type: DataTypes.INTEGER, allowNull: false },
    schoolSupplyId: { type: DataTypes.INTEGER, allowNull: false },
    warehouseId: { type: DataTypes.INTEGER, allowNull: false },
    quantityRequested: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    status: {
      type: DataTypes.ENUM(...Object.values(RequestStatus)),
      allowNull: false,
      defaultValue: RequestStatus.PENDIENTE,
    },
    notes: { type: DataTypes.STRING(500), allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: "SupplyRequest", tableName: "supply_requests" }
);

export default SupplyRequest;

export const createSupplyRequestSchema = z.object({
  schoolId: z.number().int().positive("School ID is required"),
  schoolSupplyId: z.number().int().positive("School supply ID is required"),
  warehouseId: z.number().int().positive("Warehouse ID is required"),
  quantityRequested: z.number().int().positive("Quantity must be greater than zero"),
  notes: z.string().max(500).optional(),
});

export const updateSupplyRequestStatusSchema = z.object({
  status: z.enum(["pendiente", "en_proceso", "aprobada", "rechazada", "completada"], {
    message: "Invalid status",
  }),
});
