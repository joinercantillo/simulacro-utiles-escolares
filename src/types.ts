/**
 * Enums y tipos compartidos del sistema.
 */

export enum UserRole {
  ADMIN = "admin",
  GESTOR = "gestor",
}

export enum RequestStatus {
  PENDIENTE = "pendiente",
  EN_PROCESO = "en_proceso",
  APROBADA = "aprobada",
  RECHAZADA = "rechazada",
  COMPLETADA = "completada",
}

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}
