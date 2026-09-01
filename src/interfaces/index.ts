/**
 * Enum con los roles de usuario disponibles en el sistema.
 */
export enum UserRole {
  ADMIN = "admin",
  GESTOR = "gestor",
}

/**
 * Enum con los estados posibles de una solicitud de suministro.
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
 * Interfaz que representa los datos de una institución.
 */
export interface ISchool {
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
 * Interfaz que representa los datos de un suministro escolar.
 */
export interface ISchoolSupply {
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
 * Interfaz que representa un registro de inventario de un suministro escolar en un almacén.
 */
export interface IInventory {
  id?: number;
  warehouseId: number;
  schoolSupplyId: number;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interfaz que representa una solicitud de suministro de una institución a un almacén.
 */
export interface ISupplyRequest {
  id?: number;
  schoolId: number;
  schoolSupplyId: number;
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
