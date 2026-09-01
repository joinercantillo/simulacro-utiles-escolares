# RiwiMediCare Plus API

API REST para la gestión de solicitudes de abastecimiento de medicamentos e insumos médicos.
Sistema que permite administrar clínicas, responsables, almacenes, medicamentos, inventario y el
ciclo de vida completo de las solicitudes de abastecimiento.

## Nombre del Coder

**Johana Duque** (actualiza con tu nombre y vérificalo antes de entregar)

## Clan

**Clan:** Node.js – Ruta de entrenamiento (actualiza con tu clan antes de entregar)

## Tecnologías utilizadas

| Tecnología   | Versión | Uso                                             |
| ------------ | ------- | ----------------------------------------------- |
| Node.js      | 18+     | Entorno de ejecución                            |
| TypeScript   | 5.x     | Lenguaje tipado                                 |
| Express      | 4.x     | Framework HTTP para la API REST                 |
| Sequelize    | 6.x     | ORM para PostgreSQL                             |
| PostgreSQL   | 16.x    | Base de datos relacional                        |
| JSON Web Token (JWT) | 9.x | Autenticación y protección de rutas             |
| Multer       | 1.x     | Carga de archivos JSON como Seeders             |
| Swagger      | 6.x     | Documentación de la API (Swagger UI)            |
| Jest         | 29.x    | Pruebas unitarias                               |
| Docker       | 3.x     | Contenerización (punto extra)                   |

## Requisitos previos

- Node.js 18 o superior.
- PostgreSQL 14 o superior corriendo localmente, o Docker.
- npm (Node Package Manager).

## Instructivo de instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/tu-usuario/riwimed-care-plus.git
cd riwimed-care-plus
```

2. Instalar las dependencias:

```bash
npm install
```

3. Crear el archivo de variables de entorno a partir del ejemplo:

```bash
cp .env.example .env
```

4. Crear la base de datos en PostgreSQL (si no existe):

```sql
CREATE DATABASE riwimed_care_plus;
```

5. (Opcional) Restaurar el backup incluido en la entrega:

```bash
psql -U postgres -d riwimed_care_plus -f backup-database.sql
```

## Ejemplo de variables de entorno (`.env`)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=riwimed_care_plus
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=riwimed_secret_key_2024
JWT_EXPIRES_IN=24h
```

> **Importante:** No subas el archivo `.env` a GitHub. Cambia el `JWT_SECRET` en producción.

## Ejecución del proyecto

### Modo desarrollo

```bash
npm run dev
```

Este comando compila y ejecuta la aplicación con recarga automática. Al iniciar,
las tablas se sincronizan automáticamente con Sequelize.

### Modo producción

```bash
npm run build
npm start
```

Al ejecutarse, el servidor quedará disponible en:

- API: `http://localhost:3000`
- Documentación Swagger: `http://localhost:3000/api-docs`
- Health check: `http://localhost:3000/api/health`

## Carga de Seeders (datos de prueba)

### Forma 1: Endpoint con Multer (archivo JSON)

La API expone un endpoint que recibe un archivo JSON para poblar la base de datos
como seeder. El archivo debe ser un arreglo de entidades identificadas con la
propiedad `__type` (`user`, `clinic`, `warehouse`, `medication`, `inventory`, `request`).

```bash
curl -X POST http://localhost:3000/api/seeders/upload \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -F "file=@seed-data/users.json"
```

En la carpeta `seed-data/` encontrarás archivos de ejemplo:

```bash
curl -X POST http://localhost:3000/api/seeders/upload -H "Authorization: Bearer <TOKEN>" -F "file=@seed-data/clinics.json"
curl -X POST http://localhost:3000/api/seeders/upload -H "Authorization: Bearer <TOKEN>" -F "file=@seed-data/warehouses.json"
curl -X POST http://localhost:3000/api/seeders/upload -H "Authorization: Bearer <TOKEN>" -F "file=@seed-data/medications.json"
curl -X POST http://localhost:3000/api/seeders/upload -H "Authorization: Bearer <TOKEN>" -F "file=@seed-data/inventory.json"
```

### Forma 2: Script de consola (opcional)

```bash
npm run seed
```

Este script sincroniza la base de datos y carga usuarios, clínicas, almacenes,
medicamentos, inventario inicial y un par de solicitudes de ejemplo.

### Forma 3: Endpoint de datos por defecto

```bash
curl -X POST http://localhost:3000/api/seeders/default -H "Authorization: Bearer <TOKEN>"
```

## Usuarios de prueba

| Rol    | Email               | Contraseña |
| ------ | ------------------- | ---------- |
| admin  | admin@riwimed.co    | admin123   |
| gestor | gestor@riwimed.co   | gestor123  |

## Endpoints principales

| Método | Ruta                        | Descripción                              | Rol     |
| ------ | --------------------------- | ---------------------------------------- | ------- |
| POST   | `/api/auth/register`        | Registrar usuario (admin/gestor)         | Público |
| POST   | `/api/auth/login`           | Iniciar sesión (JWT)                     | Público |
| GET    | `/api/clinics`              | Listar clínicas                          | Token   |
| GET    | `/api/clinics/:id`          | Clínica con historial de solicitudes     | Token   |
| POST   | `/api/clinics`              | Crear clínica                            | admin   |
| PUT    | `/api/clinics/:id`          | Actualizar clínica                       | admin   |
| DELETE | `/api/clinics/:id`          | Eliminar clínica (lógica)                | admin   |
| GET    | `/api/warehouses`           | Listar almacenes                         | Token   |
| GET    | `/api/warehouses/:id`       | Almacén con inventario                   | Token   |
| POST   | `/api/warehouses`           | Crear almacén                            | admin   |
| PUT    | `/api/warehouses/:id`       | Actualizar almacén                       | admin   |
| DELETE | `/api/warehouses/:id`       | Eliminar almacén (lógica)                | admin   |
| GET    | `/api/medications`          | Listar medicamentos                      | Token   |
| GET    | `/api/medications/:id`      | Medicamento por ID                       | Token   |
| POST   | `/api/medications`          | Crear medicamento                        | admin   |
| PUT    | `/api/medications/:id`      | Actualizar medicamento                   | admin   |
| DELETE | `/api/medications/:id`      | Eliminar medicamento (lógica)            | admin   |
| POST   | `/api/requests`             | Crear solicitud de abastecimiento        | Token   |
| GET    | `/api/requests/active`      | Solicitudes activas                      | Token   |
| GET    | `/api/requests/all`         | Historial completo de solicitudes        | Token   |
| GET    | `/api/requests/clinic/:id`  | Historial por clínica                    | Token   |
| PATCH  | `/api/requests/:id/status`  | Actualizar estado de una solicitud       | Token   |
| DELETE | `/api/requests/:id`         | Eliminar solicitud (lógica)              | admin   |
| GET    | `/api/inventory/warehouse/:id` | Inventario de un almacén               | Token   |
| POST   | `/api/inventory`            | Agregar stock (admin)                    | admin   |
| PUT    | `/api/inventory/:id`        | Actualizar cantidad de inventario        | admin   |
| POST   | `/api/seeders/upload`       | Cargar seeders desde archivo JSON        | Token   |
| POST   | `/api/seeders/default`      | Cargar datos base por defecto            | Token   |

## Estados de una solicitud

| Estado       | Descripción                       |
| ------------ | --------------------------------- |
| pendiente    | Solicitud creada, en espera       |
| en_proceso   | Solicitud en gestión de almacén   |
| aprobada     | Solicitud aprobada                |
| rechazada    | Solicitud rechazada               |
| completada   | Solicitud surtida y finalizada    |

## Validaciones implementadas

- Existencia de la clínica, el medicamento y el almacén antes de crear una solicitud.
- Disponibilidad suficiente del inventario en el almacén asignado.
- Cantidad solicitada debe ser un entero mayor a cero.
- Estados de solicitud restringidos al catálogo definido.
- No se permiten clínicas duplicadas por NIT.
- Eliminación lógica mediante el campo `isActive`.

## Pruebas unitarias

```bash
npm test -- --coverage
```

Cobertura obtenida en las funcionalidades críticas (creación de solicitudes,
consulta de clínica y responsable, cambio de estados y middlewares de autenticación):
**100%** en las entidades evaluadas.

## Docker (punto extra)

Construir y levantar la API junto con PostgreSQL:

```bash
docker-compose up --build
```

Esto levanta:

- Contenedor `riwimed-api` (aplicación en el puerto 3000).
- Contenedor `riwimed-db` (PostgreSQL en el puerto 5432).
- Volumen `pgdata` para persistencia de datos.
- Red interna `riwimed-network` entre ambos servicios.

Para detener:

```bash
docker-compose down
```

## Gitflow y estrategia de ramas

El repositorio sigue la estrategia Gitflow con Conventional Commits:

```text
main
└── develop
    ├── feature/authentication
    ├── feature/clinic-crud
    ├── feature/warehouse-inventory
    ├── feature/supply-requests
    ├── feature/seeders-upload
    └── feature/swagger-docs
```

### Formato de commits

```text
feat: agregar registro y login de usuarios
fix: validar inventario suficiente al crear solicitud
docs: documentar endpoints con Swagger
test: agregar pruebas unitarias de validación
chore: configurar Docker y docker-compose
```

## URL del repositorio (GitHub)

**Pendiente de crear.**
Crea un repositorio público en GitHub y sube el proyecto siguiendo la estrategia de ramas.
Ejemplo: `https://github.com/tu-usuario/riwimed-care-plus`

## Estructura del proyecto

```text
src/
├── app.ts                  # Punto de entrada
├── config/
│   └── database.ts         # Conexión a PostgreSQL (Sequelize)
├── controllers/            # Lógica de negocio por recurso
├── interfaces/             # Tipos e interfaces de TypeScript
├── middlewares/            # Autenticación JWT, roles y validadores
├── models/                 # Modelos de Sequelize y asociaciones
├── routes/                 # Definición de rutas de la API
├── seeders/                # Script opcional de seeders por consola
├── swagger/                # Configuración de Swagger JSDoc
seed-data/                  # Archivos JSON de ejemplo para seeders
tests/                      # Pruebas unitarias con Jest
Dockerfile                  # Imagen de la aplicación
docker-compose.yml          # Orquestación API + PostgreSQL
```

## Licencia

Proyecto académico para la ruta de formación Node.js – Riwi Coder House.