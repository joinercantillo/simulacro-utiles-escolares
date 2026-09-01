import { RequestStatus } from "../../src/interfaces";

export const VALID_STATUSES: RequestStatus[] = [
  RequestStatus.PENDIENTE,
  RequestStatus.EN_PROCESO,
  RequestStatus.APROBADA,
  RequestStatus.RECHAZADA,
  RequestStatus.COMPLETADA,
];

export class RequestStateValidator {
  public static canChangeTo(targetStatus: RequestStatus): boolean {
    return VALID_STATUSES.includes(targetStatus);
  }
}