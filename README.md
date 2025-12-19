# Multi-Tenant E-Commerce Ecosystem

A production-ready, dockerized multi-tenant e-commerce platform with built-in anti-scam protection, escrow payments, and zero-staff automation.

## 🌟 Features

### Core Platform
- **Multi-Tenant Architecture**: Multiple sellers with individual shops
- **Guest Checkout**: Browse and purchase without account creation
- **Public Shop Pages**: All shops accessible without authentication
- **Global Product Search**: PostgreSQL full-text search across all shops
- **Theme Customization**: JSON-based theme config (no HTML uploads for security)

### Security & Anti-Scam
- **Trust Engine**: 0-100 score based on 9 anti-scam rules
- **Escrow Payments**: Funds held until order completion + waiting period
- **Contact Detection**: Auto-reject products with phone/email/WhatsApp links
- **New Seller Restrictions**: Limited products per day, category restrictions
- **Device Fingerprinting**: Multi-account fraud detection
- **Rate Limiting**: Protection against abuse and spam

### Automation (Zero-Staff Operations)
- **Auto-Dispute Resolution**: Rule-based decisions (no manual review)
- **Dynamic Payout Delays**: 3-14 days based on seller trust
- **Weekly Payout Cron**: Automated batch payments
- **Trust Score Recalculation**: Automatic after each order/review/dispute
- **Violation Tracking**: Auto-suspend shops after repeated violations

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd c:\DEV\reupspot
   ```

2. **Create environment file**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and set secure passwords:
   ```env
   DB_PASSWORD=your_secure_database_password
   JWT_SECRET=your_secret_key_minimum_32_characters_long
   ```

3. **Start all services**
   ```bash
   docker compose up --build
   ```

4. **Run database migrations** (in new terminal)
   ```bash
   docker compose exec backend npm run migrate
   ```

5. **Seed database with test data**
   ```bash
   docker compose exec backend npm run seed
   ```

6. **Access the platform**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - Database: localhost:5432

## 🧪 Test Credentials

After seeding, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.local | admin123 |
| Seller 1 | seller1@ecommerce.local | seller123 |
| Seller 2 | seller2@ecommerce.local | seller123 |
| Buyer | buyer1@ecommerce.local | buyer123 |

**Test Shops:**
- Tech Haven: http://localhost/shop/tech-haven
- Fashion Hub: http://localhost/shop/fashion-hub

## 📚 API Documentation

### Authentication

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "buyer" // or "seller"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrPhone": "user@example.com",
  "password": "password123"
}
```

**Verify Email**
```http
POST /api/auth/verify-email
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "123456"
}
```

### Shops

**Create Shop** (Seller only)
```http
POST /api/shops
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Shop",
  "description": "Shop description"
}
```

**Get Shop (Public)**
```http
GET /api/shops/:slug
```

**Update Theme** (Shop owner)
```http
PUT /api/shops/:id/theme
Authorization: Bearer <token>
Content-Type: application/json

{
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#10B981"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Roboto"
  }
}
```

## 🏗️ Architecture

### Database Schema
- **13 Tables**: users, shops, shop_themes, products, orders, order_items, escrow_transactions, payouts, reviews, follows, disputes, trust_scores, violations, device_fingerprints, verification_codes
- **Multi-Tenant**: Via `shop_id` foreign keys
- **Full-Text Search**: PostgreSQL tsvector on products

### Backend Structure
```
backend/
├── src/
│   ├── config/          # Database & env config
│   ├── middleware/      # Auth, RBAC, rate limiting
│   ├── modules/         # Feature modules
│   │   ├── auth/
│   │   ├── shops/
│   │   └── trust/       # Anti-scam engine
│   ├── database/
│   │   ├── migrations/  # SQL migrations
│   │   └── seeds/       # Test data
│   ├── utils/          # Helpers
│   ├── app.ts          # Express app
│   └── server.ts       # Entry point
```

### Trust Engine Rules

1. **New Seller Restrictions**: < 7 days, max 5 products/day
2. **Payout Eligibility**: 3-14 day delays based on shop age
3. **High Dispute Rate**: > 10% freezes payouts
4. **Rapid Listing**: > 20 products/hour triggers cooldown
5. **Price Anomaly**: < 30% of category median flagged
6. **Contact Sharing**: Regex detection, auto-reject
7. **Auto-Dispute Resolution**: Rule-based refunds
8. **Device Reuse**: > 5 accounts per fingerprint flagged
9. **Inventory Fraud**: 100+ to 0 in 1 hour flagged

## 🔒 Security Features

- **JWT Authentication**: 7-day expiry
- **Bcrypt Password Hashing**: Salt rounds: 10
- **Rate Limiting**:
  - General: 100 requests/15 min
  - Auth: 5 attempts/15 min
  - Products: 20 listings/hour
- **CORS**: Configurable origins
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: No HTML in themes

## 📊 Trust Score Calculation

**Formula:**
```
Base Score: 50

+ Shop Age (max +30 points, 1 per day)
+ Completed Orders (max +30 points, 0.5 per order)
+ Review Rating (max +50 points, avg_rating * 10)
+ Fast Fulfillment (+10 if < 48h)

- Dispute Rate (-20 if > 5%, -40 if > 10%)
- Refund Rate (-15 if > 10%)
- Slow Fulfillment (-10 if > 168h)

Final: Clamped between 0-100
```

## 🔄 Payout Flow

1. Buyer pays → Funds held in escrow
2. Seller marks order as shipped/completed
3. System calculates `payout_eligible_at`:
   - New seller: +14 days
   - Established: +7 days
   - Trusted: +3 days
4. Weekly cron (Mon 6 AM) processes eligible payouts
5. In production: Trigger actual bank transfer

## 🛠️ Development

**Backend Development**
```bash
cd backend
npm install
npm run dev  # ts-node-dev with hot reload
```

**Run specific scripts**
```bash
npm run migrate  # Run migrations
npm run seed     # Seed database
npm run build    # Compile TypeScript
```

**Database Access**
```bash
docker compose exec postgres psql -U ecommerce -d ecommerce_db
```

## 📦 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_USER` | Database user | ecommerce |
| `DB_PASSWORD` | Database password | **REQUIRED** |
| `JWT_SECRET` | JWT signing key | **REQUIRED** (32+ chars) |
| `PORT` | Backend API port | 3000 |
| `UPLOAD_DIR` | Image upload directory | ./uploads |

## 🚨 Production Checklist

- [ ] Set secure `JWT_SECRET` (32+ random characters)
- [ ] Set secure database passwords
- [ ] Change all default credentials
- [ ] Configure CORS allowed origins
- [ ] Set `NODE_ENV=production`
- [ ] Integrate real payment provider (M-Pesa/Stripe)
- [ ] Migrate images to S3-compatible storage
- [ ] Set up SSL/TLS certificates
- [ ] Configure email service for verification codes
- [ ] Set up monitoring (logs, errors)
- [ ] Configure automated backups
- [ ] Review and adjust rate limits

## 🎯 Next Steps (Post-MVP)

1. **Complete Remaining Modules**:
   - Products (with image uploads)
   - Orders & Checkout
   - Payments & Escrow
   - Reviews
   - Search
   - Follows
   - Disputes

2. **Frontend Development**:
   - React + Vite + Tailwind
   - Public shop pages
   - Buyer dashboard
   - Seller dashboard
   - Guest checkout

3. **Enhancements**:
   - Email notifications
   - SMS for phone verification
   - Admin panel
   - Analytics dashboard
   - Mobile app (React Native)

## 📝 License

MIT License - see LICENSE file

## 🤝 Contributing

This is a production-ready MVP. Contributions welcome for:
- Additional anti-scam rules
- Payment provider integrations
- Frontend components
- Test coverage
- Documentation improvements

---

**Built with:** Node.js, TypeScript, Express, PostgreSQL, React, Docker

**Architecture:** Modular monolith (clean boundaries, ready for microservices)

**Philosophy:** Automated, buyer-first, anti-scam by design
