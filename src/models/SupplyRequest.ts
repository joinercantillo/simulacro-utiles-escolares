import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import School from "./School";
import SchoolSupply from "./SchoolSupply";
import Warehouse from "./Warehouse";
import { RequestStatus } from "../interfaces";

/**
 * Modelo Sequelize que representa la tabla de solicitudes de suministro entre instituciones y almacenes.
 */
class SupplyRequest extends Model {
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

/**
 * Inicializa el modelo SupplyRequest definiendo sus atributos y configuración de la tabla "supply_requests".
 */
SupplyRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    schoolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: School,
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
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Warehouse,
        key: "id",
      },
    },
    quantityRequested: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RequestStatus)),
      allowNull: false,
      defaultValue: RequestStatus.PENDIENTE,
    },
    notes: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "SupplyRequest",
    tableName: "supply_requests",
  }
);

export default SupplyRequest;
