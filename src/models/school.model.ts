import { DataTypes, Model, Optional } from "sequelize";
import { z } from "zod";
import sequelize from "../config/database";

/**
 * Interfaz que representa una institución educativa del sistema.
 */
export interface ISchool {
  id: number;
  name: string;
  nit: string;
  address: string;
  phone: string;
  responsibleName: string;
  responsibleEmail: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tipo para creación de institución (id es autoincremental).
 */
export type SchoolCreationAttributes = Optional<ISchool, "id" | "isActive" | "createdAt" | "updatedAt">;

/**
 * Modelo Sequelize que representa la tabla de instituciones del sistema.
 */
class School extends Model<ISchool, SchoolCreationAttributes> {
  public id!: number;
  public name!: string;
  public nit!: string;
  public address!: string;
  public phone!: string;
  public responsibleName!: string;
  public responsibleEmail!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

School.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    nit: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    address: { type: DataTypes.STRING(200), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    responsibleName: { type: DataTypes.STRING(150), allowNull: false },
    responsibleEmail: { type: DataTypes.STRING(150), allowNull: false, validate: { isEmail: true } },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: "School", tableName: "schools" }
);

export default School;

/**
 * Esquemas de validación Zod para instituciones.
 */
export const createSchoolSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(150),
  nit: z.string().min(1, "El NIT es requerido").max(30),
  address: z.string().min(1, "La dirección es requerida").max(200),
  phone: z.string().min(1, "El teléfono es requerido").max(20),
  responsibleName: z.string().min(1, "El nombre del responsable es requerido").max(150),
  responsibleEmail: z.string().email("El email del responsable no es válido"),
});

export const updateSchoolSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  nit: z.string().min(1).max(30).optional(),
  address: z.string().min(1).max(200).optional(),
  phone: z.string().min(1).max(20).optional(),
  responsibleName: z.string().min(1).max(150).optional(),
  responsibleEmail: z.string().email().optional(),
});
