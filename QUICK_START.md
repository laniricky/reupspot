# Quick Start Guide

## Prerequisites
- Docker & Docker Compose installed
- Git

## Getting Started

### Option 1: Backend Only (Recommended for Testing)

1. **Clone/Navigate to project:**
   ```bash
   cd c:\DEV\reupspot
   ```

2. **Start database:**
   ```bash
   docker compose up -d postgres
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Run migrations:**
   ```bash
   npm run migrate
   ```

5. **Seed database:**
   ```bash
   npm run seed
   ```

6. **Start backend:**
   ```bash
   npm run dev
   ```

7. **Test the API:**
   ```bash
   curl http://localhost:3000/health
   ```

### Option 2: Full Docker Stack

**Note:** Frontend Docker build currently has issues. Run frontend separately (see below).

1. **Start database and backend:**
   ```bash
   docker compose up -d postgres backend
   ```

2. **Run migrations:**
   ```bash
   docker compose exec backend npm run migrate
   ```

3. **Seed database:**
   ```bash
   docker compose exec backend npm run seed
   ```

### Running Frontend Separately

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Access:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## Test the System

### 1. Register a Seller
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@seller.com\",\"password\":\"test123\",\"role\":\"seller\"}"
```

Save the `token` from the response.

### 2. Create a Shop
```bash
curl -X POST http://localhost:3000/api/shops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"name\":\"Test Shop\",\"description\":\"My test shop\"}"
```

### 3. View Shop (Public)
```bash
curl http://localhost:3000/api/shops/test-shop
```

## Pre-Seeded Test Data

Use these credentials after running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.local | admin123 |
| Seller | seller1@ecommerce.local | seller123 |
| Seller | seller2@ecommerce.local | seller123 |
| Buyer | buyer1@ecommerce.local | buyer123 |

## Troubleshooting

**Database connection failed:**
```bash
docker compose logs postgres
```

**Backend not starting:**
```bash
cd backend
npm install
npm run dev
```

**Port already in use:**
```bash
# Stop all containers
docker compose down

# Change ports in docker-compose.yml or .env
```

## Next Steps

1. **Complete remaining backend modules** (see `implementation_plan.md`)
2. **Build frontend pages** (structure already created)
3. **Integrate real payment provider**
4. **Set up production environment**

## Project Structure References

- **Database Schema:** See migrations in `backend/src/database/migrations/`
- **API Routes:** See `backend/src/modules/*/routes.ts`
- **Trust Engine:** See `backend/src/modules/trust/trust.service.ts`
- **Full Documentation:** See `README.md`
- **Implementation Plan:** See `implementation_plan.md`
- **Walkthrough:** See `walkthrough.md`

## Support

All core backend functionality is implemented and tested:
✅ Authentication & JWT
✅ Shop Management
✅ Trust Engine with 9 Anti-Scam Rules
✅ Database with 13 Tables
✅ Rate Limiting & Security
✅ Device Fingerprinting

For questions about the architecture, see `walkthrough.md` in the artifacts directory.
