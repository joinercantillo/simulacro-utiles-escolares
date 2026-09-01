# RiwiSchool Plus API – Distribución de Útiles Escolares

API REST para la gestión de solicitudes de abastecimiento de **útiles escolares**.
El sistema permite que las **instituciones educativas (colegios)** soliciten útiles escolares
(cuadernos, lápices, colores, resmas de papel, morrales) a las **bodegas** encargadas de su
almacenamiento y despacho, administrando responsables, inventario, stock y el
ciclo de vida completo de las solicitudes de abastecimiento.

## Nombre del Coder

**Johana Duque** (actualiza con tu nombre y verifícalo antes de entregar)

## Clan

**Clan:** Node.js – Ruta de entrenamiento (actualiza con tu clan antes de entregar)

## Contexto del proyecto

> Un colegio necesita reabastecerse de útiles escolares para el inicio del año lectivo.
> Su rectora inicia sesión en RiwiSchool Plus, consulta el catálogo de suministros escolares,
> verifica la disponibilidad de stock en la bodega y crea una solicitud de útiles.
> Un gestor de la bodega recibe la solicitud, la aprueba y coordina el despacho.

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
git clone https://github.com/joinercantillo/simulacro-utiles-escolares.git
cd simulacro-utiles-escolares
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
CREATE DATABASE riwischool_plus;
```

5. (Opcional) Restaurar el backup incluido en la entrega:

```bash
psql -U postgres -d riwischool_plus -f backup-database.sql
```

## Ejemplo de variables de entorno (`.env`)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=riwischool_plus
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=riwischool_secret_key_2024
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
propiedad `__type` (`user`, `school`, `warehouse`, `schoolSupply`, `inventory`, `request`).

```bash
curl -X POST http://localhost:3000/api/seeders/upload \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -F "file=@seed-data/users.json"
```

En la carpeta `seed-data/` encontrarás archivos de ejemplo con temática escolar
(colegios, bodegas y útiles como cuadernos, lápices y colores):

```bash
curl -X POST http://localhost:3000/api/seeders/upload -H "Authorization: Bearer <TOKEN>" -F "file=@seed-data/schools.json"
curl -X POST http://localhost:3000/api/seeders/upload -H "Authorization: Bearer <TOKEN>" -F "file=@seed-data/warehouses.json"
curl -X POST http://localhost:3000/api/seeders/upload -H "Authorization: Bearer <TOKEN>" -F "file=@seed-data/school-supplies.json"
curl -X POST http://localhost:3000/api/seeders/upload -H "Authorization: Bearer <TOKEN>" -F "file=@seed-data/inventory.json"
```

### Forma 2: Script de consola (opcional)

```bash
npm run seed
```

Este script sincroniza la base de datos y carga usuarios, instituciones educativas,
bodegas, suministros escolares (útiles), inventario inicial y un par de solicitudes
de ejemplo.

### Forma 3: Endpoint de datos por defecto

```bash
curl -X POST http://localhost:3000/api/seeders/default -H "Authorization: Bearer <TOKEN>"
```

## Usuarios de prueba

| Rol    | Email               | Contraseña |
| ------ | ------------------- | ---------- |
| admin  | admin@riwischool.co | admin123   |
| gestor | gestor@riwischool.co | gestor123  |

## Endpoints principales

| Método | Ruta                             | Descripción                              | Rol     |
| ------ | -------------------------------- | ---------------------------------------- | ------- |
| POST   | `/api/auth/register`             | Registrar usuario (admin/gestor)         | Público |
| POST   | `/api/auth/login`                | Iniciar sesión (JWT)                     | Público |
| GET    | `/api/schools`                   | Listar instituciones educativas          | Token   |
| GET    | `/api/schools/:id`               | Institución con historial de solicitudes | Token   |
| POST   | `/api/schools`                   | Crear institución educativa              | admin   |
| PUT    | `/api/schools/:id`               | Actualizar institución educativa         | admin   |
| DELETE | `/api/schools/:id`               | Eliminar institución (lógica)            | admin   |
| GET    | `/api/warehouses`                | Listar bodegas                           | Token   |
| GET    | `/api/warehouses/:id`            | Bodega con su inventario de útiles       | Token   |
| POST   | `/api/warehouses`                | Crear bodega                             | admin   |
| PUT    | `/api/warehouses/:id`            | Actualizar bodega                        | admin   |
| DELETE | `/api/warehouses/:id`            | Eliminar bodega (lógica)                 | admin   |
| GET    | `/api/school-supplies`           | Listar útiles escolares                  | Token   |
| GET    | `/api/school-supplies/:id`       | Útil escolar por ID                      | Token   |
| POST   | `/api/school-supplies`           | Crear útil escolar                       | admin   |
| PUT    | `/api/school-supplies/:id`       | Actualizar útil escolar                  | admin   |
| DELETE | `/api/school-supplies/:id`       | Eliminar útil escolar (lógica)           | admin   |
| POST   | `/api/requests`                  | Crear solicitud de útiles escolares      | Token   |
| GET    | `/api/requests/active`           | Solicitudes activas                      | Token   |
| GET    | `/api/requests/all`              | Historial completo de solicitudes        | Token   |
| GET    | `/api/requests/school/:id`       | Historial por institución                | Token   |
| PATCH  | `/api/requests/:id/status`       | Actualizar estado de una solicitud       | Token   |
| DELETE | `/api/requests/:id`              | Eliminar solicitud (lógica)              | admin   |
| GET    | `/api/inventory/warehouse/:id`   | Inventario de una bodega                 | Token   |
| POST   | `/api/inventory`                 | Agregar stock de útiles (admin)          | admin   |
| PUT    | `/api/inventory/:id`             | Actualizar cantidad de inventario        | admin   |
| POST   | `/api/seeders/upload`            | Cargar seeders desde archivo JSON        | Token   |
| POST   | `/api/seeders/default`           | Cargar datos base por defecto            | Token   |

## Estados de una solicitud

| Estado       | Descripción                            |
| ------------ | -------------------------------------- |
| pendiente    | Solicitud creada, en espera de revisión |
| en_proceso   | Solicitud en gestión de la bodega       |
| aprobada     | Solicitud aprobada                      |
| rechazada    | Solicitud rechazada                     |
| completada   | Solicitud surtida y finalizada          |

## Validaciones implementadas

- Existencia de la institución educativa, el útil escolar y la bodega antes de crear una solicitud.
- Disponibilidad suficiente del stock de útiles en la bodega asignada.
- Cantidad solicitada debe ser un entero mayor a cero.
- Estados de solicitud restringidos al catálogo definido.
- No se permiten instituciones educativas duplicadas por NIT.
- Eliminación lógica mediante el campo `isActive`.

## Pruebas unitarias

```bash
npm test -- --coverage
```

Cobertura obtenida en las funcionalidades críticas (creación de solicitudes,
consulta de institución y responsable, cambio de estados y middlewares de autenticación):
**100%** en las entidades evaluadas.

## Docker (punto extra)

Construir y levantar la API junto con PostgreSQL:

```bash
docker-compose up --build
```

Esto levanta:

- Contenedor `riwischool-api` (aplicación en el puerto 3000).
- Contenedor `riwischool-db` (PostgreSQL en el puerto 5432).
- Volumen `pgdata` para persistencia de datos.
- Red interna `riwischool-network` entre ambos servicios.

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
    ├── feature/school-crud
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

**https://github.com/joinercantillo/simulacro-utiles-escolares**

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