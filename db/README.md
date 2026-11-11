# KDP GreenSource Enterprise — PostgreSQL Database Integration Guide

This directory contains the production-grade PostgreSQL database schema, initial seed dataset, and core sourcing queries for the KDP GreenSource Enterprise Inventory system.

---

## 📁 Directory Structure

- `schema.sql` — Complete PostgreSQL 14+ DDL schema with UUIDs, ENUM types, primary/foreign keys, indexes, and constraints.
- `seed.sql` — Initial seed data for roasting facilities, users (`Maya Torres`), green coffee catalogue, alternates, local/central inventory, purchase orders, shipments, and alerts.
- `queries.sql` — Core SQL logic for:
  - Auto-replenishment calculation (`(open_demand + min_threshold) - (available + incoming)`)
  - Lowest-cost central warehouse selector (`landed_cost = unit_cost - rebate + freight`)
  - Sourcing waterfall cascade evaluation
  - OTIF (On-Time In-Full) performance metric

---

## 🚀 Quick Setup (PostgreSQL Database)

### Option A: Using Docker (Recommended for local dev)

```bash
# 1. Start a local PostgreSQL 16 container
docker run --name kdp-postgres \
  -e POSTGRES_DB=kdp_greensource \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16

# 2. Run schema migration
docker exec -i kdp-postgres psql -U postgres -d kdp_greensource < db/schema.sql

# 3. Load initial seed data
docker exec -i kdp-postgres psql -U postgres -d kdp_greensource < db/seed.sql
```

### Option B: Using Existing PostgreSQL Server / Cloud (Supabase, Neon, AWS RDS)

```bash
psql -h <host> -U <user> -d kdp_greensource -f db/schema.sql
psql -h <host> -U <user> -d kdp_greensource -f db/seed.sql
```

---

## 🔑 Default Enterprise Credentials

- **Email:** `maya.torres@kdpgreensource.com`
- **Password:** `AustinRoast2026!`
- **Role:** `Local Buyer`
- **Facility:** `Site 1054 — Plano Roasting`

---

## 🌐 Connecting the Frontend

Set the API base URL in your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The frontend includes a unified API client in `src/services/` that will call your REST/GraphQL API endpoints. When `VITE_API_BASE_URL` is omitted or the backend is offline, the frontend seamlessly uses the in-memory fallback datasets.

