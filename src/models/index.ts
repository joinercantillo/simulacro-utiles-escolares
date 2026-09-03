import School from "./school.model";
import SupplyRequest from "./supplyRequest.model";
import Warehouse from "./warehouse.model";
import SchoolSupply from "./schoolSupply.model";
import Inventory from "./inventory.model";

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

export { School, SupplyRequest, Warehouse, SchoolSupply, Inventory };
