import School from "./School";
import SupplyRequest from "./SupplyRequest";
import Warehouse from "./Warehouse";
import SchoolSupply from "./SchoolSupply";
import Inventory from "./Inventory";

School.hasMany(SupplyRequest, { foreignKey: "schoolId", as: "requests" });
SupplyRequest.belongsTo(School, { foreignKey: "schoolId", as: "school" });

SchoolSupply.hasMany(SupplyRequest, { foreignKey: "schoolSupplyId", as: "requests" });
SupplyRequest.belongsTo(SchoolSupply, { foreignKey: "schoolSupplyId", as: "schoolSupply" });

Warehouse.hasMany(SupplyRequest, { foreignKey: "warehouseId", as: "requests" });
SupplyRequest.belongsTo(Warehouse, { foreignKey: "warehouseId", as: "warehouse" });

Warehouse.hasMany(Inventory, { foreignKey: "warehouseId", as: "inventories" });
Inventory.belongsTo(Warehouse, { foreignKey: "warehouseId", as: "warehouse" });

SchoolSupply.hasMany(Inventory, { foreignKey: "schoolSupplyId", as: "inventories" });
Inventory.belongsTo(SchoolSupply, { foreignKey: "schoolSupplyId", as: "schoolSupply" });

/**
 * Exporta todos los modelos y define las relaciones entre ellos.
 * @returns Referencias a los modelos School, SupplyRequest, Warehouse, SchoolSupply e Inventory.
 */
export { School, SupplyRequest, Warehouse, SchoolSupply, Inventory };
