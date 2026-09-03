import { DataTypes, Model, Optional } from "sequelize";
import { z } from "zod";
import sequelize from "../config/database";
import { UserRole } from "../types";

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<IUser, "id" | "isActive" | "createdAt" | "updatedAt">;

class User extends Model<IUser, UserCreationAttributes> {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.GESTOR,
    },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: "User", tableName: "users" }
);

export default User;

export const registerUserSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  email: z.string().email("El email no es válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["admin", "gestor"]).optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email("El email no es válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});
