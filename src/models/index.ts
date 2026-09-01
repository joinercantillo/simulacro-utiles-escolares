import Clinic from "./Clinic";
import SupplyRequest from "./SupplyRequest";
import Warehouse from "./Warehouse";
import Medication from "./Medication";
import Inventory from "./Inventory";

Clinic.hasMany(SupplyRequest, { foreignKey: "clinicId", as: "requests" });
SupplyRequest.belongsTo(Clinic, { foreignKey: "clinicId", as: "clinic" });

Medication.hasMany(SupplyRequest, { foreignKey: "medicationId", as: "requests" });
SupplyRequest.belongsTo(Medication, { foreignKey: "medicationId", as: "medication" });

Warehouse.hasMany(SupplyRequest, { foreignKey: "warehouseId", as: "requests" });
SupplyRequest.belongsTo(Warehouse, { foreignKey: "warehouseId", as: "warehouse" });

Warehouse.hasMany(Inventory, { foreignKey: "warehouseId", as: "inventories" });
Inventory.belongsTo(Warehouse, { foreignKey: "warehouseId", as: "warehouse" });

Medication.hasMany(Inventory, { foreignKey: "medicationId", as: "inventories" });
Inventory.belongsTo(Medication, { foreignKey: "medicationId", as: "medication" });

/**
 * Exporta todos los modelos y define las relaciones entre ellos.
 * @returns Referencias a los modelos Clinic, SupplyRequest, Warehouse, Medication e Inventory.
 */
export { Clinic, SupplyRequest, Warehouse, Medication, Inventory };
