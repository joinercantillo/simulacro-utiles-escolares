interface InventoryStock {
  schoolSupplyId: number;
  warehouseId: number;
  quantity: number;
}

interface RequestLine {
  schoolId: number;
  schoolSupplyId: number;
  warehouseId: number;
  quantityRequested: number;
}

export class SupplyRequestValidator {
  private inventory: InventoryStock[];

  constructor(inventory: InventoryStock[]) {
    this.inventory = inventory;
  }

  public validateQuantityRequested(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity > 0;
  }

  public validateStock(request: RequestLine): boolean {
    const stock = this.inventory.find(
      (item) =>
        item.schoolSupplyId === request.schoolSupplyId &&
        item.warehouseId === request.warehouseId
    );

    if (!stock) {
      return false;
    }

    return stock.quantity >= request.quantityRequested;
  }
}

export class SchoolValidator {
  private existingNits: Set<string>;

  constructor(existingNits: string[]) {
    this.existingNits = new Set(existingNits);
  }

  public isDuplicatedNit(nit: string): boolean {
    return this.existingNits.has(nit);
  }

  public hasResponsible(school: { responsibleName: string }): boolean {
    return Boolean(school.responsibleName && school.responsibleName.trim().length > 0);
  }
}