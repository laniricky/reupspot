BUILD A MULTI-TENANT E-COMMERCE ECOSYSTEM (DOCKERIZED)
ROLE

You are a senior systems architect + full-stack engineer.
Design and implement a production-ready, multi-tenant e-commerce ecosystem that can run with zero staff and near-zero budget in year one, and scale later.

The system must be secure, anti-scam by design, automated, and self-running.

CORE PRODUCT REQUIREMENTS
PLATFORM OVERVIEW

Build a multi-seller e-commerce platform where:

Sellers can:

Create shops

Customize shop themes (colors, layout via config — NOT raw HTML)

List products

Receive orders

Buyers can:

Browse all shops without logging in

Search products globally

Checkout as guest

Create accounts to follow shops and leave reviews

Platform:

Uses escrow-style payments

Prevents scam shops via rules, delays, and automation

Requires no manual moderation initially

YEAR-1 CONSTRAINTS (CRITICAL)

No office

No staff

No paid APIs

No manual review queues

Everything must be automated and rule-based

Use open-source tools only

Run entirely in Docker

ARCHITECTURE REQUIREMENTS
1. Backend

Language: Node.js (TypeScript preferred)

Framework: Express

Architecture: Modular monolith (clean boundaries), not microservices yet

Authentication: JWT

Authorization: Role-based (buyer, seller, admin)

2. Database

PostgreSQL

Multi-tenant via shop_id

Explicit schemas and indexes

Use migrations

3. Frontend

React (Vite)

Tailwind CSS

Public buyer pages must be accessible without login

Seller dashboard requires authentication

4. Payments (Simulated but Realistic)

Escrow logic implemented

Assume M-Pesa-style flow (STK simulation)

Funds held before payout

Weekly payout batch simulation

CORE FEATURES TO IMPLEMENT
AUTH & USERS

Email + phone verification

Guest checkout

Buyer & seller roles

Device fingerprinting (basic)

SHOP MANAGEMENT (MULTI-TENANT)

Create shop

Public shop page

Shop slug routing

Shop age tracking

Shop status (active, frozen)

THEME SYSTEM (NO HTML UPLOADS)

Theme templates defined in code

Theme config stored as JSON:

colors

fonts

layout options

Frontend renders shop dynamically based on config

PRODUCT CATALOG

Products belong to a shop

Categories

Inventory tracking

Image uploads (use local or mock storage)

CART & CHECKOUT

One cart per shop

Guest checkout supported

Order creation

Order status lifecycle

ESCROW & PAYOUT LOGIC (ANTI-SCAM CORE)

Buyer pays → funds held in escrow

Seller cannot withdraw instantly

Payout eligibility based on:

Seller age

Order completion

Dispute history

Weekly payout job (cron)

TRUST & ANTI-SCAM RULE ENGINE

Implement a rule-based Trust Engine (no ML):

Signals to track:

Seller age

Number of disputes

Refund rate

Order fulfillment time

Number of listings per hour

Price deviation from category median

Rules examples:

Freeze payouts if dispute rate > X

Restrict new sellers from high-risk categories

Block external contact sharing

Auto-ban after N violations

Expose seller trust indicators publicly:

“New seller” badge

Shop age

Completed orders

REVIEWS

Reviews allowed only after order completion

One review per order

No anonymous reviews

SEARCH

Global product search

Use PostgreSQL full-text search

No external search services

FOLLOW SYSTEM

Buyers can follow shops

Store follow relationships

Simple activity feed (new product events)

DISPUTES (NO STAFF)

Buyer can open dispute

System auto-decides using rules:

No shipment → refund

Multiple disputes → freeze seller

SECURITY & ABUSE PREVENTION

Rate limiting

CAPTCHA

Prevent sellers from sharing WhatsApp/Telegram links

Device/IP reuse detection

DOCKER REQUIREMENTS (MANDATORY)

Use Docker Compose

Services:

backend

frontend

postgres

Environment variables

One-command startup:

docker compose up --build

DELIVERABLES

You MUST produce:

System architecture explanation

Database schema (tables + relationships)

Backend API routes (documented)

Frontend structure

Trust engine logic

Escrow & payout logic

Dockerfiles + docker-compose.yml

Seed data

Instructions to run locally

NON-NEGOTIABLE RULES

No paid services

No placeholders like “implement later”

Code must be runnable

Assume production mindset

Prioritize buyer protection over seller convenience

Optimize for automation, not humans

GOAL

The result should be a fully working MVP that:

Can run unattended

Protects buyers

Discourages scam sellers

Can scale into a real company after 1 year

END OF PROMPT