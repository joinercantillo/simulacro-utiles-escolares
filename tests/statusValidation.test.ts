import { RequestStateValidator, VALID_STATUSES } from "./helpers/statusValidator";
import { RequestStatus } from "../src/interfaces";

describe("Cambio de estado de solicitudes", () => {
  test("debe permitir actualizar a estados válidos", () => {
    expect(RequestStateValidator.canChangeTo(RequestStatus.APROBADA)).toBe(true);
    expect(RequestStateValidator.canChangeTo(RequestStatus.EN_PROCESO)).toBe(true);
    expect(RequestStateValidator.canChangeTo(RequestStatus.COMPLETADA)).toBe(true);
  });

  test("debe rechazar estados no permitidos", () => {
    expect(RequestStateValidator.canChangeTo("cancelada" as RequestStatus)).toBe(false);
    expect(RequestStateValidator.canChangeTo("entregada" as RequestStatus)).toBe(false);
    expect(RequestStateValidator.canChangeTo("pausada" as RequestStatus)).toBe(false);
  });

  test("la lista de estados válidos contiene los 5 estados del caso de uso", () => {
    expect(VALID_STATUSES).toHaveLength(5);
    expect(VALID_STATUSES).toContain(RequestStatus.PENDIENTE);
    expect(VALID_STATUSES).toContain(RequestStatus.RECHAZADA);
  });
});