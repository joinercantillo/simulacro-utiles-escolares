-- -------------------------------------------------------------
-- RiwiMediCare Plus - Backup de base de datos
-- PostgreSQL
-- Fecha: 2026-09-01
-------------------------------------------------------------

DROP TABLE IF EXISTS supply_requests;
DROP TABLE IF EXISTS inventories;
DROP TABLE IF EXISTS medications;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS clinics;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS "enum_SupplyRequests_status";
DROP TYPE IF EXISTS "enum_Users_role";

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(100)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,
    role          VARCHAR(50)   NOT NULL,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE clinics (
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

CREATE TABLE medications (
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
    warehouse_id  INTEGER     NOT NULL REFERENCES warehouses (id),
    medication_id INTEGER     NOT NULL REFERENCES medications (id),
    quantity      INTEGER     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (warehouse_id, medication_id)
);

CREATE TABLE supply_requests (
    id                 SERIAL PRIMARY KEY,
    clinic_id          INTEGER      NOT NULL REFERENCES clinics (id),
    medication_id      INTEGER      NOT NULL REFERENCES medications (id),
    warehouse_id       INTEGER      NOT NULL REFERENCES warehouses (id),
    quantity_requested INTEGER      NOT NULL CHECK (quantity_requested > 0),
    status             VARCHAR(50)  NOT NULL DEFAULT 'pendiente',
    notes              VARCHAR(500),
    is_active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- Datos base (Seeders)
-------------------------------------------------------------

INSERT INTO users (name, email, password, role, is_active) VALUES
('Administrador Principal', 'admin@riwimed.co', '$2a$10$U8J1/9lNjWmjRnAaKHn1.ONH0epT/ip3DNvS2NaEhfmvGgB94yrEq', 'admin', true),
('Gestor de Solicitudes', 'gestor@riwimed.co', '$2a$10$UkHEK54VVytSO99VVP/Qd.owhZ1.qK.ZHYdJbFP2Rz5KTZmA9zHzG', 'gestor', true);

INSERT INTO clinics (name, nit, address, phone, responsible_name, responsible_email) VALUES
('Clínica Vida Sana', '900123456-1', 'Calle 10 # 20-30', '3001234567', 'María López', 'maria.lopez@vidasana.co'),
('Centro Médico Esperanza', '900654321-8', 'Av. 68 # 45-12', '3119876543', 'Carlos Pérez', 'carlos.perez@centroesperanza.co');

INSERT INTO warehouses (name, location, responsible_name, responsible_email) VALUES
('Almacén Central', 'Zona Industrial Norte Bodega 1', 'Ana Torres', 'ana.torres@riwimed.co'),
('Almacén Sur', 'Carrera 30 # 12-85', 'Jorge Ramírez', 'jorge.ramirez@riwimed.co');

INSERT INTO medications (name, description, category, unit) VALUES
('Acetaminofén', 'Analgésico y antipirético', 'Analgésicos', 'caja'),
('Ibuprofeno', 'Antiinflamatorio no esteroideo', 'Antiinflamatorios', 'caja'),
('Amoxicilina', 'Antibiótico de amplio espectro', 'Antibióticos', 'frasco'),
('Loratadina', 'Antihistamínico', 'Antialérgicos', 'caja'),
('Suero Oral', 'Solución de rehidratación oral', 'Hidratación', 'sobre');

INSERT INTO inventories (warehouse_id, medication_id, quantity) VALUES
(1, 1, 100),
(1, 2, 80),
(1, 3, 50),
(2, 4, 120),
(2, 5, 200),
(2, 1, 60);

INSERT INTO supply_requests (clinic_id, medication_id, warehouse_id, quantity_requested, status, notes) VALUES
(1, 1, 1, 20, 'aprobada', 'Reabastecimiento mensual'),
(2, 4, 2, 15, 'pendiente', 'Primera solicitud');