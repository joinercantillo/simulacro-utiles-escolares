import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Warehouse from "./Warehouse";
import Medication from "./Medication";

/**
 * Modelo Sequelize que representa la tabla de inventario, relacionando almacenes con medicamentos.
 */
class Inventory extends Model {
  public id!: number;
  public warehouseId!: number;
  public medicationId!: number;
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
    medicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Medication,
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
