# RiwiSchool Plus API – School Supplies Distribution

REST API for managing **school supplies** supply requests. The system allows **school institutions**
to request school supplies (notebooks, pencils, colored pencils, paper reams, backpacks) from the
**warehouses** in charge of storing and shipping them, managing responsible persons, inventory, stock
and the complete lifecycle of the supply requests.

## Coder Name

**Joiner Cantillo**

## Clan

**Clan:** Node.js – Training path (update with your clan before submitting)

## Project Context

> A school needs to restock its school supplies for the start of the school year.
> Its principal logs in to RiwiSchool Plus, browses the school supplies catalog,
> checks stock availability at the warehouse and creates a supplies request.
> A warehouse manager receives the request, approves it and coordinates the shipment.

## Technologies Used

| Technology | Version | Usage |
| --- | --- | --- |
| Node.js | 18+ | Runtime environment |
| TypeScript | 5.x | Typed language |
| Express | 4.x | HTTP framework for the REST API |
| Sequelize | 6.x | ORM for PostgreSQL |
| PostgreSQL | 16.x | Relational database |
| JSON Web Token (JWT) | 9.x | Authentication and route protection |
| Multer | 1.x | JSON upload as Seeders |
| Swagger | 6.x | API documentation (Swagger UI) |
| Jest | 29.x | Unit tests |
| Docker | 3.x | Containerization (extra point) |

## Prerequisites

- Node.js 18 or higher.
- PostgreSQL 14 or higher running locally, or Docker.
- npm (Node Package Manager).

## Installation Guide

1. Clone the repository:

```bash
git clone https://github.com/joinercantillo/simulacro-utiles-escolares.git
cd simulacro-utiles-escolares
```

2. Install dependencies:

```bash
npm install
```

3. Create the environment variables file from the example:

```bash
cp .env.example .env
```

4. Create the database in PostgreSQL (if it does not exist):

```sql
CREATE DATABASE riwischool_plus;
```

5. (Optional) Restore the backup included in the delivery:

```bash
psql -U postgres -d riwischool_plus -f backup-database.sql
```

## Environment variables example (`.env`)

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

## Running the project

### Development mode

```bash
npm run dev
```

This command compiles and runs the application with automatic reload. On startup,
the tables are synchronized automatically with Sequelize.

### Production mode

```bash
npm run build
npm start
```

Once running, the server will be available at:

- API: `http://localhost:3000`
- Swagger documentation: `http://localhost:3000/api-docs`
- Health check: `http://localhost:3000/api/health`

## Loading Seeders (test data)

> **Important:** `npm run seed` runs `sequelize.sync({ force: true })`, which **drops and recreates
> all tables**, deleting any existing data. Do **not** run it while the API is already live without
> expecting loss of data. Prefer the `/api/seeder/default` endpoint (Form 3 below) to load the base
> data without dropping tables.

### Form 1: Endpoint with Multer (JSON file)

The API exposes an endpoint that receives a JSON file to populate the database as a seeder.
The file must be an array of entities identified with the `__type` property
(`user`, `school`, `warehouse`, `schoolSupply`, `inventory`, `request`).

```bash
curl -X POST http://localhost:3000/api/seeder/upload \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "file=@seed-data/users.json"
```

In the `seed-data/` folder you will find example files with the school theme
(schools, warehouses and supplies such as notebooks, pencils and colored pencils):

```bash
curl -X POST http://localhost:3000/api/seeder/upload -H "Authorization: Bearer <TOKEN>" -F "file=@seed-data/schools.json"
curl -X POST http://localhost:3000/api/seeder/upload -H "Authorization: Bearer <TOKEN>" -F "file=@seed-data/warehouses.json"
curl -X POST http://localhost:3000/api/seeder/upload -H "Authorization: Bearer <TOKEN>" -F "file=@seed-data/school-supplies.json"
curl -X POST http://localhost:3000/api/seeder/upload -H "Authorization: Bearer <TOKEN>" -F "file=@seed-data/inventory.json"
```

### Form 2: Console script (optional)

```bash
npm run seed
```

> **Warning:** This script runs `sequelize.sync({ force: true })` — it **drops and recreates all
> tables**, wiping existing data. Stop the running API (Ctrl+C) before running it locally.

If your API runs inside a Docker container (`riwischool-api`), run the seed inside the container:

```bash
docker exec riwischool-api npx ts-node src/seeders/run-seeder.ts
```

This script synchronizes the database and loads users, educational institutions, warehouses,
school supplies, initial inventory and a couple of example requests.

### Form 3: Default data endpoint (recommended)

Loads the base data **without dropping tables**:

```bash
curl -X POST http://localhost:3000/api/seeder/default -H "Authorization: Bearer <TOKEN>"
```

This is the recommended way to load the base data when the API is already running.

## Test users

| Role | Email | Password |
| --- | --- | --- |
| admin | admin@riwischool.co | admin123 |
| gestor | gestor@riwischool.co | gestor123 |

## Main endpoints

> **Note:** After the architecture refactor, the resource paths use the singular form.

| Method | Route | Description | Role |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Register a user (admin/gestor) | Public |
| POST | `/api/auth/login` | Log in (JWT) | Public |
| GET | `/api/school` | List school institutions | Token |
| GET | `/api/school/:id` | School with its request history | Token |
| POST | `/api/school` | Create a school | admin |
| PUT | `/api/school/:id` | Update a school | admin |
| DELETE | `/api/school/:id` | Delete a school (logical) | admin |
| GET | `/api/warehouse` | List warehouses | Token |
| GET | `/api/warehouse/:id` | Warehouse with its supplies inventory | Token |
| POST | `/api/warehouse` | Create a warehouse | admin |
| PUT | `/api/warehouse/:id` | Update a warehouse | admin |
| DELETE | `/api/warehouse/:id` | Delete a warehouse (logical) | admin |
| GET | `/api/school-supply` | List school supplies | Token |
| GET | `/api/school-supply/:id` | School supply by ID | Token |
| POST | `/api/school-supply` | Create a school supply | admin |
| PUT | `/api/school-supply/:id` | Update a school supply | admin |
| DELETE | `/api/school-supply/:id` | Delete a school supply (logical) | admin |
| POST | `/api/request` | Create a school supplies request | Token |
| GET | `/api/request/active` | Active requests | Token |
| GET | `/api/request/all` | Full request history | Token |
| GET | `/api/request/school/:id` | History by school | Token |
| PATCH | `/api/request/:id/status` | Update a request status | Token |
| DELETE | `/api/request/:id` | Delete a request (logical) | admin |
| GET | `/api/inventory/warehouse/:id` | Inventory of a warehouse | Token |
| POST | `/api/inventory` | Add supplies stock (admin) | admin |
| PUT | `/api/inventory/:id` | Update inventory quantity | admin |
| POST | `/api/seeder/upload` | Load seeders from a JSON file | Token |
| POST | `/api/seeder/default` | Load default data | Token |

## Request statuses

| Status | Description |
| --- | --- |
| pending | Request created, awaiting review |
| in_progress | Request being processed by the warehouse |
| approved | Request approved |
| rejected | Request rejected |
| completed | Request fulfilled and finished |

## Implemented validations

- Existence of the school, the school supply and the warehouse before creating a request.
- Sufficient school supplies stock available at the assigned warehouse.
- Requested quantity must be an integer greater than zero.
- Request statuses restricted to the defined catalog.
- Duplicate schools by NIT are not allowed.
- Logical deletion through the `isActive` field.

## Unit tests

```bash
npm test -- --coverage
```

Coverage obtained on the critical features (request creation, school and responsible person query,
status changes and authentication middlewares): **100%** on the evaluated entities.

## Docker (extra point)

Docker is used only to run PostgreSQL. The API runs locally with `npm run dev` for development
convenience and testing with Postman.

Start only PostgreSQL:

```bash
docker compose up -d db
```

Start everything (API + PostgreSQL) in Docker (optional, for deployment):

```bash
docker compose up -d --build
```

This starts:

- Container `riwischool-db` (PostgreSQL on port 5432).
- Volume `pgdata` for data persistence.
- Volume `uploads` to persist uploaded files.
- Internal network `riwischool-network` between both services.

To stop PostgreSQL:

```bash
docker compose down
```

## Automation scripts (Ubuntu)

In the `scripts/` folder there are `.sh` scripts to install dependencies and start
the project automatically on Ubuntu.

### Script 1 — Install system dependencies

Installs Docker, Docker Compose, Node.js 18+ and Git on Ubuntu:

```bash
chmod +x scripts/install-deps.sh
./scripts/install-deps.sh
```

> **Note:** When it finishes, close and reopen the terminal so the `docker`
> group takes effect without needing `sudo`.

### Script 2 — Start PostgreSQL with Docker

Start only the database in Docker (to use with `npm run dev`):

```bash
chmod +x scripts/docker-start.sh
./scripts/docker-start.sh
```

### Script 3 — Full setup (install + start + run)

Runs everything at once: installs dependencies, starts PostgreSQL in Docker,
creates the database, installs `node_modules` and starts `npm run dev` automatically
so you can test with Postman:

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Scripts summary

| Script | What it does |
| --- | --- |
| `install-deps.sh` | Installs Docker, Docker Compose, Node.js 18+ and Git |
| `docker-start.sh` | Starts PostgreSQL in Docker and creates the DB |
| `setup.sh` | All in one: dependencies + PostgreSQL + npm run dev |

## Automation scripts (Windows)

In the `winscripts/` folder there are `.bat` scripts to install dependencies and start
the project automatically on Windows 10/11.

### Script 1 — Install system dependencies

Installs Docker Desktop, Node.js 18+ and Git using `winget`:

```cmd
winscripts\install-deps.bat
```

> **Note:** `winget` is required (included in up-to-date Windows 10/11). If you don't have it,
> install it from the Microsoft Store: https://aka.ms/getwinget

### Script 2 — Start PostgreSQL with Docker

Start only the database in Docker (to use with `npm run dev`):

```cmd
winscripts\docker-start.bat
```

### Script 3 — Full setup (install + start + run)

Runs everything at once: installs dependencies, starts PostgreSQL in Docker,
creates the database, installs `node_modules` and starts `npm run dev` automatically
so you can test with Postman:

```cmd
winscripts\setup.bat
```

### Windows scripts summary

| Script | What it does |
| --- | --- |
| `install-deps.bat` | Installs Docker Desktop, Node.js 18+ and Git (winget) |
| `docker-start.bat` | Starts PostgreSQL in Docker and creates the DB |
| `setup.bat` | All in one: dependencies + PostgreSQL + npm run dev |

## Gitflow and branching strategy

The repository follows the Gitflow strategy with Conventional Commits:

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

### Commit format

```text
feat: add user registration and login
fix: validate sufficient inventory when creating a request
docs: document endpoints with Swagger
test: add unit tests for validation
chore: configure Docker and docker-compose
```

## Repository URL (GitHub)

**https://github.com/joinercantillo/simulacro-utiles-escolares**

## Project structure

```text
src/
├── app.ts                  # Entry point
├── config/
│   └── database.ts         # PostgreSQL connection (Sequelize)
├── middlewares/            # JWT auth, roles and validators
├── models/                 # Sequelize models, interfaces and Zod schemas (*.model.ts)
├── routes/                 # API route definitions with inline logic (*.router.ts)
├── seeders/                # Optional console seeders script
├── swagger/                # Swagger JSDoc configuration
├── types.ts                # Shared enums (UserRole, RequestStatus, JwtPayload)
seed-data/                  # Example JSON files for seeders
scripts/                    # Automation scripts (.sh) for Ubuntu
winscripts/                 # Automation scripts (.bat) for Windows
tests/                      # Unit tests with Jest
Dockerfile                  # Application image
docker-compose.yml          # Orchestration API + PostgreSQL
```

## License

Academic project for the Node.js training path – Riwi Coder House.
