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

export interface IInventory {
  id?: number;
  warehouseId: number;
  medicationId: number;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

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

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}
