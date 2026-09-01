import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

/**
 * Modelo Sequelize que representa la tabla de almacenes del sistema.
 */
class Warehouse extends Model {
  public id!: number;
  public name!: string;
  public location!: string;
  public responsibleName!: string;
  public responsibleEmail!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inicializa el modelo Warehouse definiendo sus atributos y configuración de la tabla "warehouses".
 */
Warehouse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    responsibleName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    responsibleEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Warehouse",
    tableName: "warehouses",
  }
);

export default Warehouse;
