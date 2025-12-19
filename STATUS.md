# System Status: ✅ Fully Operational

## Current Architecture
- **Backend:** Running in Docker with `node:18-slim` (Linux)
- **Database:** PostgreSQL 15 in Docker with named volume persistence
- **Configuration:** 
  - Host `node_modules` ignored (clean builds)
  - Named volume `backend_node_modules` stores container dependencies
  - Database name is consistently `ecommerce`

## How to Run (Reliable Method)

The system is configured to run entirely within Docker to avoid environment mismatches.

### 1. Start the System
```powershell
cd c:\DEV\reupspot
docker compose up -d
```
*Note: This starts Postgres, Backend, and Frontend.*

### 2. Check Backend Health
```powershell
curl http://localhost:3000/health
# Should return {"status":"ok",...}
```

### 3. Register a User (Test API)
```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@test.com","password":"securePass123!","role":"admin"}'
```

### 4. Admin Tasks (Migrations/Seeds)
To run administrative commands, execute them *inside* the backend container:

```powershell
# Run Migrations (Already completed)
docker compose exec backend npx ts-node src/database/migrate.ts

# Seed Data (Optional)
docker compose exec backend npx ts-node src/database/seeds/seed.ts
```

## Troubleshooting

**If you see "invalid ELF header":**
This means Windows binaries got into the Linux container. 
Fix it by clearing the named volume:
```powershell
docker compose down -v
docker compose up --build -d
```

**If database connection fails:**
Ensure you are using the Docker approach. Host-to-Docker connections are more fragile on Windows.

## Development Workflow

1. Edit code in `c:\DEV\reupspot\backend\src`
2. Save file
3. The backend container (`npm run dev`) automatically hot-reloads!
4. Check logs: `docker compose logs -f backend`

## Backend API Endpoints (Ready)
- `/api/auth/*` - Register, Login, Verify
- `/api/shops/*` - Create, View, Manage Shops
- `/api/trust/*` - Trust Score Engine
