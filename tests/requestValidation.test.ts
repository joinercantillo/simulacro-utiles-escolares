import { SchoolValidator, SupplyRequestValidator } from "./helpers/requestValidator";

describe("Creación de solicitud de abastecimiento", () => {
  const inventory = [
    { schoolSupplyId: 1, warehouseId: 1, quantity: 100 },
    { schoolSupplyId: 2, warehouseId: 1, quantity: 30 },
    { schoolSupplyId: 3, warehouseId: 2, quantity: 10 },
  ];

  const validator = new SupplyRequestValidator(inventory);

  test("debe permitir crear solicitud cuando hay stock suficiente", () => {
    const request = {
      schoolId: 1,
      schoolSupplyId: 1,
      warehouseId: 1,
      quantityRequested: 20,
    };
    expect(validator.validateStock(request)).toBe(true);
  });

  test("debe rechazar solicitud cuando el stock es insuficiente", () => {
    const request = {
      schoolId: 1,
      schoolSupplyId: 2,
      warehouseId: 1,
      quantityRequested: 500,
    };
    expect(validator.validateStock(request)).toBe(false);
  });

  test("debe rechazar cantidades menores o iguales a cero", () => {
    expect(validator.validateQuantityRequested(0)).toBe(false);
    expect(validator.validateQuantityRequested(-5)).toBe(false);
    expect(validator.validateQuantityRequested(1.5)).toBe(false);
    expect(validator.validateQuantityRequested(10)).toBe(true);
  });

  test("debe rechazar solicitud cuando no existe inventario del suministro escolar en el almacén", () => {
    const request = {
      schoolId: 1,
      schoolSupplyId: 99,
      warehouseId: 1,
      quantityRequested: 1,
    };
    expect(validator.validateStock(request)).toBe(false);
  });
});

describe("Consulta de institución y asociación de responsable", () => {
  const schoolValidator = new SchoolValidator(["900123456-1", "900654321-8"]);

  test("debe detectar que el NIT está duplicado", () => {
    expect(schoolValidator.isDuplicatedNit("900123456-1")).toBe(true);
  });

  test("debe permitir registrar un NIT nuevo", () => {
    expect(schoolValidator.isDuplicatedNit("111222333-4")).toBe(false);
  });

  test("la institución debe poseer un responsable asociado", () => {
    expect(schoolValidator.hasResponsible({ responsibleName: "María López" })).toBe(true);
    expect(schoolValidator.hasResponsible({ responsibleName: "" })).toBe(false);
    expect(schoolValidator.hasResponsible({ responsibleName: "   " })).toBe(false);
  });
});