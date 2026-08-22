# Storyline Event Management ERP

## Prerequisites
- Java 21 (JDK)
- Maven 3.9+
- Docker & Docker Compose
- Node.js 20+ & npm

## Quick Start

### 1. Start Infrastructure
```bash
docker-compose up -d
```
This starts PostgreSQL, Redis, and pgAdmin.

### 2. Build & Run Backend
```bash
mvn clean install
cd storyline-app
mvn spring-boot:run
```
Backend runs at: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html

### 3. Run Frontend
```bash
cd storyline-frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

### 4. Default Admin Login
- Email: admin@storyline.com
- Password: Admin@123

## Services
| Service   | URL                        |
|-----------|----------------------------|
| Backend   | http://localhost:8080       |
| Swagger   | http://localhost:8080/swagger-ui.html |
| Frontend  | http://localhost:5173       |
| pgAdmin   | http://localhost:5050       |
| PostgreSQL| localhost:5432             |
| Redis     | localhost:6379             |

## Project Structure
```
storyline-erp/
├── storyline-common/     # Shared utilities, DTOs, base entities
├── storyline-app/        # Main Spring Boot application
├── module-identity/      # Auth, Users, Roles, Permissions
├── module-crm/           # Leads, Clients, Follow-ups (Phase 2)
├── module-sales/         # Quotations, Versions (Phase 2)
├── module-events/        # Events, Plans (Phase 3)
├── module-teams/         # Teams, Members (Phase 3)
├── module-vendors/       # Vendors, Assignments (Phase 3)
├── module-tasks/         # Tasks, Checklists (Phase 3)
├── module-hampers/       # Products, BOM, Manufacturing (Phase 4)
├── module-inventory/     # Stock, Dispatch (Phase 4)
├── module-finance/       # Invoices, Payments, P&L (Phase 5)
└── storyline-frontend/   # React + Vite + TypeScript
```
