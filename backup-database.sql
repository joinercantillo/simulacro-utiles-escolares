-- -------------------------------------------------------------
-- RiwiSchool Plus - Backup de base de datos
-- PostgreSQL
-- Fecha: 2026-09-01
-- -------------------------------------------------------------

DROP TABLE IF EXISTS supply_requests;
DROP TABLE IF EXISTS inventories;
DROP TABLE IF EXISTS school_supplies;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS schools;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS "enum_SupplyRequests_status";
DROP TYPE IF EXISTS "enum_Users_role";

CREATE TYPE "enum_Users_role" AS ENUM ('admin', 'gestor');
CREATE TYPE "enum_SupplyRequests_status" AS ENUM ('pendiente', 'en_proceso', 'aprobada', 'rechazada', 'completada');

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(100)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,
    role          "enum_Users_role" NOT NULL,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE schools (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(150) NOT NULL,
    nit               VARCHAR(30)  NOT NULL UNIQUE,
    address           VARCHAR(200) NOT NULL,
    phone             VARCHAR(20)  NOT NULL,
    responsible_name  VARCHAR(150) NOT NULL,
    responsible_email VARCHAR(150) NOT NULL,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE warehouses (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(150) NOT NULL,
    location          VARCHAR(200) NOT NULL,
    responsible_name  VARCHAR(150) NOT NULL,
    responsible_email VARCHAR(150) NOT NULL,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE school_supplies (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    category    VARCHAR(100) NOT NULL,
    unit        VARCHAR(50)  NOT NULL DEFAULT 'unidad',
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE inventories (
    id            SERIAL PRIMARY KEY,
    warehouseId   INTEGER  NOT NULL REFERENCES warehouses (id),
    schoolSupplyId INTEGER NOT NULL REFERENCES school_supplies (id),
    quantity      INTEGER  NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (warehouseId, schoolSupplyId)
);

CREATE TABLE supply_requests (
    id                 SERIAL PRIMARY KEY,
    schoolId           INTEGER NOT NULL REFERENCES schools (id),
    schoolSupplyId     INTEGER NOT NULL REFERENCES school_supplies (id),
    warehouseId        INTEGER NOT NULL REFERENCES warehouses (id),
    quantityRequested  INTEGER NOT NULL CHECK (quantityRequested > 0),
    status             "enum_SupplyRequests_status" NOT NULL DEFAULT 'pendiente',
    notes              VARCHAR(500),
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- Datos base (Seeders)
-- -------------------------------------------------------------

INSERT INTO users (name, email, password, role, is_active) VALUES
('Administrador Principal', 'admin@riwischool.co', '$2a$10$U8J1/9lNjWmjRnAaKHn1.ONH0epT/ip3DNvS2NaEhfmvGgB94yrEq', 'admin', true),
('Gestor de Solicitudes', 'gestor@riwischool.co', '$2a$10$UkHEK54VVytSO99VVP/Qd.owhZ1.qK.ZHYdJbFP2Rz5KTZmA9zHzG', 'gestor', true);

INSERT INTO schools (name, nit, address, phone, responsible_name, responsible_email) VALUES
('Colegio La Esperanza', '900123456-1', 'Calle 10 # 20-30', '3001234567', 'María López', 'maria.lopez@esperanza.co'),
('Institución Educativa San José', '900654321-8', 'Av. 68 # 45-12', '3119876543', 'Carlos Pérez', 'carlos.perez@sanjose.co'),
('Colegio Técnico del Norte', '800555123-4', 'Cra 45 # 67-89', '3151112233', 'Laura Giraldo', 'laura.giraldo@ctn.co');

INSERT INTO warehouses (name, location, responsible_name, responsible_email) VALUES
('Bodega Central', 'Zona Industrial Norte Bodega 1', 'Ana Torres', 'ana.torres@riwischool.co'),
('Bodega Sur', 'Carrera 30 # 12-85', 'Jorge Ramírez', 'jorge.ramirez@riwischool.co');

INSERT INTO school_supplies (name, description, category, unit) VALUES
('Cuaderno cuadriculado', 'Cuaderno de 100 hojas tamaño carta', 'Papelería', 'unidad'),
('Lápiz grafito HB', 'Lápiz de grafito estándar con borrador', 'Papelería', 'caja'),
('Resma de papel', 'Resma de 500 hojas carta x75g', 'Papelería', 'resma'),
('Colores x12', 'Caja de 12 colores escolares', 'Artes', 'caja'),
('Morral escolar', 'Morral escolar con compartimientos', 'Uniformes y accesorios', 'unidad'),
('Tijeras punta roma', 'Tijeras escolares de seguridad', 'Artes', 'unidad');

INSERT INTO inventories (warehouseId, schoolSupplyId, quantity) VALUES
(1, 1, 500),
(1, 2, 300),
(1, 3, 150),
(1, 6, 80),
(2, 4, 400),
(2, 5, 600),
(2, 1, 250);

INSERT INTO supply_requests (schoolId, schoolSupplyId, warehouseId, quantityRequested, status, notes) VALUES
(1, 1, 1, 20, 'aprobada', 'Reabastecimiento mensual'),
(2, 4, 2, 15, 'pendiente', 'Primera solicitud');