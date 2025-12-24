# Development Guide - ReupSpot

## Prerequisites

- Docker Desktop installed
- Git
- Node.js 18+ (for local development outside Docker)

---

## Quick Start

### 1. Clone and Setup

```bash
cd c:\DEV\reupspot
cp .env.example .env
```

Edit `.env` and set secure values for:
- `JWT_SECRET` - Minimum 32 characters
- `DB_PASSWORD` - Secure database password

### 2. Start Services

```bash
docker compose up -d --build
```

This starts:
- PostgreSQL database on port 5432
- Backend API on port 3000
- Frontend on port 80

### 3. Run Migrations

```bash
docker compose exec backend npx ts-node src/database/migrate.ts
```

### 4. Seed Test Data (Optional)

```bash
docker compose exec backend npx ts-node src/database/seeds/seed.ts
```

### 5. Verify

```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

---

## Development Workflow

### Backend Development

The backend auto-reloads on file changes:

```bash
# Watch logs
docker compose logs -f backend

# Access database
docker compose exec postgres psql -U ecommerce -d ecommerce

# Run TypeScript
docker compose exec backend npx ts-node src/path/to/script.ts
```

### Frontend Development

```bash
cd frontend
npm run dev  # Runs on port 5173 with hot reload
```

---

## Project Structure

```
reupspot/
├── backend/
│   ├── src/
│   │   ├── config/           # Database & env config
│   │   ├── database/
│   │   │   ├── migrations/   # SQL migration files
│   │   │   └── seeds/        # Test data
│   │   ├── middleware/       # Auth, RBAC, rate limiting
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── disputes/
│   │   │   ├── follows/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── products/
│   │   │   ├── reviews/
│   │   │   ├── search/
│   │   │   ├── shops/
│   │   │   └── trust/
│   │   ├── scripts/          # Cron jobs, utilities
│   │   ├── utils/            # Helpers, errors, logger
│   │   ├── app.ts            # Express app setup
│   │   └── server.ts         # Entry point
│   ├── uploads/              # Product images
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API clients
│   │   ├── contexts/        # React contexts
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── API_DOCUMENTATION.md
├── README.md
└── .env
```

---

## Module Architecture

Each backend module follows this pattern:

```
modules/feature/
├── feature.service.ts     # Business logic
├── feature.controller.ts  # HTTP handlers
└── feature.routes.ts      # Route definitions
```

### Example: Creating a New Module

1. Create directory in `src/modules/`
2. Create service with business logic
3. Create controller with HTTP handlers
4. Create routes and register in `app.ts`

---

## Database Migrations

### Creating a Migration

```bash
# Create new SQL file
backend/src/database/migrations/XXX_description.sql
```

Format:
```sql
-- Migration: Description
-- Version: XXX
-- Description: What this migration does

CREATE TABLE example (...);
```

### Running Migrations

```bash
docker compose exec backend npx ts-node src/database/migrate.ts
```

---

## Trust Engine Rules

The trust engine (`trust.service.ts`) implements 9 anti-scam rules:

1. **New Seller Restrictions** - 5 products/day, no high-risk categories
2. **Contact Detection** - Blocks phone/email/WhatsApp in listings
3. **Trust Scoring** - 0-100 based on age, orders, disputes
4. **Dynamic Payout Delays** - 3-14 days based on trust
5. **Rapid Listing Detection** - > 20 products/hour flagged
6. **Price Anomaly Detection** - < 30% category median flagged
7. **Auto-Dispute Resolution** - No shipment → refund
8. **Device Reuse Detection** - > 5 accounts/fingerprint flagged
9. **Inventory Fraud** - 100→0 in 1 hour flagged

---

##Scheduled Jobs

### Weekly Payout Cron

Runs every Monday at 6:00 AM:

```bash
# Manual run
docker compose exec backend npx ts-node src/scripts/payout.cron.ts
```

To enable automatic scheduling, add to `server.ts`:
```typescript
import { scheduleWeeklyPayout } from './scripts/payout.cron';
scheduleWeeklyPayout();
```

---

## Testing

### Manual API Testing

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","role":"seller"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"test@example.com","password":"Test123!"}'

# Use token in subsequent requests
TOKEN="<token from login response>"

curl http://localhost:3000/api/shops \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### "Invalid ELF header" error

Windows binaries got into Linux container:
```bash
docker compose down -v
docker compose up --build -d
```

### Backend not responding

Check logs:
```bash
docker compose logs backend
```

Restart:
```bash
docker compose restart backend
```

### Database connection issues

Verify database is healthy:
```bash
docker compose ps
```

Connect directly:
```bash
docker compose exec postgres psql -U ecommerce -d ecommerce
```

### Port already in use

Change ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Backend
  - "81:80"      # Frontend
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Backend port | 3000 |
| `DB_HOST` | Database host | postgres |
| `DB_PORT` | Database port | 5432 |
| `DB_USER` | Database user | ecommerce |
| `DB_PASSWORD` | Database password | **Required** |
| `DB_NAME` | Database name | ecommerce |
| `JWT_SECRET` | JWT signing key | **Required** (32+ chars) |
| `UPLOAD_DIR` | Upload directory | /app/uploads |

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Set strong `JWT_SECRET` (32+ random characters)
- [ ] Set secure `DB_PASSWORD`
- [ ] Change all default test credentials
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS allowed origins in `app.ts`
- [ ] Set up SSL/TLS certificates
- [ ] Configure email service for verification
- [ ] Set up monitoring and logging
- [ ] Configure automated database backups
- [ ] Review and adjust rate limits
- [ ] Migrate images to cloud storage (S3/GCS)
- [ ] Integrate real payment provider (M-Pesa/Stripe)

### Deployment Steps

1. **Build production images**
```bash
docker compose -f docker-compose.prod.yml build
```

2. **Push to registry**
```bash
docker tag reupspot-backend registry.example.com/reupspot-backend
docker push registry.example.com/reupspot-backend
```

3. **Deploy to server**
```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow existing patterns in modules
- Add JSDoc comments for public methods
- Use async/await over callbacks
- Handle errors properly (never swallow errors)

### Pull Request Process

1. Create feature branch from `main`
2. Make changes following code style
3. Test locally with Docker
4. Update API documentation if needed
5. Submit PR with description

---

## Support & Resources

- API Documentation: `API_DOCUMENTATION.md`
- Implementation Plan: `.gemini/antigravity/brain/.../implementation_plan.md`
- Task Tracking: `.gemini/antigravity/brain/.../task.md`
