import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Clinic from "./Clinic";
import Medication from "./Medication";
import Warehouse from "./Warehouse";
import { RequestStatus } from "../interfaces";

class SupplyRequest extends Model {
  public id!: number;
  public clinicId!: number;
  public medicationId!: number;
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
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clinicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Clinic,
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
