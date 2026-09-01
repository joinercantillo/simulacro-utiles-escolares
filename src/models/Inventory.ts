import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Warehouse from "./Warehouse";
import SchoolSupply from "./SchoolSupply";

/**
 * Modelo Sequelize que representa la tabla de inventario, relacionando almacenes con suministros escolares.
 */
class Inventory extends Model {
  public id!: number;
  public warehouseId!: number;
  public schoolSupplyId!: number;
  public quantity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inicializa el modelo Inventory definiendo sus atributos y configuración de la tabla "inventories".
 */
Inventory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Warehouse,
        key: "id",
      },
    },
    schoolSupplyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SchoolSupply,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    modelName: "Inventory",
    tableName: "inventories",
  }
);

export default Inventory;
