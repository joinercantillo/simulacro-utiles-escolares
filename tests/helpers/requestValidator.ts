interface InventoryStock {
  medicationId: number;
  warehouseId: number;
  quantity: number;
}

interface RequestLine {
  clinicId: number;
  medicationId: number;
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
        item.medicationId === request.medicationId &&
        item.warehouseId === request.warehouseId
    );

    if (!stock) {
      return false;
    }

    return stock.quantity >= request.quantityRequested;
  }
}

export class ClinicValidator {
  private existingNits: Set<string>;

  constructor(existingNits: string[]) {
    this.existingNits = new Set(existingNits);
  }

  public isDuplicatedNit(nit: string): boolean {
    return this.existingNits.has(nit);
  }

  public hasResponsible(clinic: { responsibleName: string }): boolean {
    return Boolean(clinic.responsibleName && clinic.responsibleName.trim().length > 0);
  }
}