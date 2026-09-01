import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

/**
 * Modelo Sequelize que representa la tabla de suministros escolares del sistema.
 */
class SchoolSupply extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public category!: string;
  public unit!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inicializa el modelo SchoolSupply definiendo sus atributos y configuración de la tabla "school_supplies".
 */
SchoolSupply.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "unidad",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "SchoolSupply",
    tableName: "school_supplies",
  }
);

export default SchoolSupply;
