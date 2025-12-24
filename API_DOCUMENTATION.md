# ReupSpot API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Core Endpoints

### Authentication (`/api/auth`)

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "phone": "+254712345678",
  "role": "buyer" // or "seller"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "buyer"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrPhone": "user@example.com",
  "password": "Password123!"
}
```

---

### Shops (`/api/shops`)

#### Create Shop (Seller only)
```http
POST /api/shops
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Shop",
  "description": "Quality products",
  "slug": "my-shop"
}
```

#### Get Shop (Public)
```http
GET /api/shops/:slug
```

#### Update Shop Theme
```http
PUT /api/shops/:id/theme
Authorization: Bearer <token>

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

---

### Products (`/api/products`)

#### Create Product (Seller only)
```http
POST /api/products
Authorization: Bearer <token>

{
  "shopId": "uuid",
  "name": "Product Name",
  "description": "Product description",
  "price": 1500,
  "category": "electronics",
  "inventoryCount": 10,
  "images": ["url1", "url2"]
}
```

**Anti-Scam Protection:** Products with contact info (phone/email/WhatsApp) will be rejected.

---

### Cart (`/api/cart`)

#### Add to Cart (Guest or Authenticated)
```http
POST /api/cart/:shopId/items

{
  "productId": "uuid",
  "quantity": 2
}
```

#### Get Cart
```http
GET /api/cart/:shopId
```

#### Checkout
```http
POST /api/cart/:shopId/checkout

// For guests:
{
  "email": "guest@example.com",
  "phone": "+254712345678",
  "address": "123 Main St, Nairobi"
}

// For authenticated users:
{} // Empty body, user info from token
```

---

### Search (`/api/search`)

#### Search Products
```http
GET /api/search/products?q=phone&category=electronics&minPrice=1000&maxPrice=50000&page=1&limit=20
```

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### Search Shops
```http
GET /api/search/shops?q=fashion
```

#### Get Categories
```http
GET /api/search/categories
```

---

### Reviews (`/api/reviews`)

#### Create Review (Buyer only, completed order required)
```http
POST /api/reviews
Authorization: Bearer <token>

{
  "orderId": "uuid",
  "rating": 5,
  "comment": "Great product and fast shipping!"
}
```

#### Get Shop Reviews
```http
GET /api/reviews/shop/:shopId?page=1&limit=10
```

#### Get Shop Rating
```http
GET /api/reviews/shop/:shopId/rating
```

**Response:**
```json
{
  "average": 4.5,
  "count": 120
}
```

---

### Follows (`/api/follows`)

#### Follow Shop
```http
POST /api/follows/:shopId
Authorization: Bearer <token>
```

#### Unfollow Shop
```http
DELETE /api/follows/:shopId
Authorization: Bearer <token>
```

#### Get Followed Shops
```http
GET /api/follows
Authorization: Bearer <token>
```

#### Get Activity Feed
```http
GET /api/follows/feed?page=1&limit=20
Authorization: Bearer <token>
```

**Response:** Returns new products from followed shops.

---

### Disputes (`/api/disputes`)

#### Open Dispute
```http
POST /api/disputes
Authorization: Bearer <token>

{
  "orderId": "uuid",
  "reason": "Product not received after 10 days"
}
```

**Auto-Resolution:** System automatically:
- Refunds if no shipment after 7 days
- Freezes shop if dispute rate > 10%

#### Get My Disputes
```http
GET /api/disputes/my
Authorization: Bearer <token>
```

#### Get Shop Dispute Stats (Public)
```http
GET /api/disputes/shop/:shopId/stats
```

---

### Trust (`/api/trust`)

#### Get Shop Trust Score (Public)
```http
GET /api/trust/shop/:shopId
```

**Response:**
```json
{
  "shopId": "uuid",
  "trustScore": 75,
  "trustLevel": "established",
  "payoutDelayDays": 7,
  "indicators": [
    "Good track record",
    "Regular seller"
  ]
}
```

#### Get Trust Badge
```http
GET /api/trust/shop/:shopId/badge
```

---

### Orders (`/api/orders`)

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>

{
  "shopId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 1500
    }
  ],
  "shippingAddress": "123 Main St, Nairobi"
}
```

#### Get My Orders
```http
GET /api/orders/my?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

#### Mark as Shipped (Seller only)
```http
PUT /api/orders/:id/ship
Authorization: Bearer <token>
```

---

### Payments (`/api/payments`)

#### Get Escrow Status
```http
GET /api/payments/escrow/:orderId
Authorization: Bearer <token>
```

#### Get Payouts (Seller only)
```http
GET /api/payments/payouts
Authorization: Bearer <token>
```

---

## Trust & Anti-Scam Rules

### 1. Contact Detection
- Products/descriptions with phone numbers, emails, WhatsApp/Telegram links are auto-rejected
- Violation recorded, 3 strikes → shop suspension

### 2. New Seller Restrictions
- < 7 days old: max 5 products/day
- Cannot list in high-risk categories (electronics, phones, laptops)

### 3. Trust Scoring (0-100)
- Base score: 50
- Shop age: +1 per day (max +30)
- Completed orders: +0.5 per order (max +30)
- Average rating: rating × 10 (max +50)
- Dispute rate > 10%: -40
- Refund rate > 10%: -15
- Fast fulfillment (< 48h): +10
- Slow fulfillment (> 7 days): -10

### 4. Dynamic Payout Delays
- New sellers (< 7 days): 14 days
- Established (< 30 days): 7 days
- Trusted (> 30 days, low disputes): 3 days

### 5. Auto-Dispute Resolution
- No shipment after 7 days → auto-refund
- Keywords like "fake", "scam", "never received" + no shipment → auto-refund
- High dispute rate (> 10%) → shop frozen
- 5+ refunded disputes → shop frozen

### 6. Shop Suspension
- 3 violations of same type in 30 days → auto-suspend
- Automatic in case of high dispute rates

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

Common status codes:
- `400` - Bad Request (validation error, contact info detected, etc.)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- General API: 100 requests / 15 minutes
- Auth endpoints: 5 attempts / 15 minutes
- Product creation: 20 listings / hour (new sellers: 5/day)

---

## Guest Checkout Flow

1. Browse products (no auth needed)
2. Add to cart (session cookie created automatically)
3. Checkout with email/phone/address
4. Order created with guest info
5. Optional: Create account later, carts merge automatically

---

## Seller Payout Flow

1. Buyer completes order
2. Funds held in escrow
3. `payout_eligible_at` calculated based on trust level
4. Weekly cron (Monday 6 AM) processes eligible payouts
5. In production: triggers actual bank transfer
