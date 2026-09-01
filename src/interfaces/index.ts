/**
 * Enum con los roles de usuario disponibles en el sistema.
 */
export enum UserRole {
  ADMIN = "admin",
  GESTOR = "gestor",
}

/**
 * Enum con los estados posibles de una solicitud de insumo.
 */
export enum RequestStatus {
  PENDIENTE = "pendiente",
  EN_PROCESO = "en_proceso",
  APROBADA = "aprobada",
  RECHAZADA = "rechazada",
  COMPLETADA = "completada",
}

/**
 * Interfaz que representa los datos de un usuario del sistema.
 */
export interface IUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interfaz que representa los datos de una clínica.
 */
export interface IClinic {
  id?: number;
  name: string;
  nit: string;
  address: string;
  phone: string;
  responsibleName: string;
  responsibleEmail: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interfaz que representa los datos de un almacén.
 */
export interface IWarehouse {
  id?: number;
  name: string;
  location: string;
  responsibleName: string;
  responsibleEmail: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interfaz que representa los datos de un medicamento.
 */
export interface IMedication {
  id?: number;
  name: string;
  description: string;
  category: string;
  unit: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interfaz que representa un registro de inventario de un medicamento en un almacén.
 */
export interface IInventory {
  id?: number;
  warehouseId: number;
  medicationId: number;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interfaz que representa una solicitud de insumo de una clínica a un almacén.
 */
export interface ISupplyRequest {
  id?: number;
  clinicId: number;
  medicationId: number;
  warehouseId: number;
  quantityRequested: number;
  status: RequestStatus;
  notes?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interfaz que representa los datos decodificados de un token JWT.
 */
export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}
