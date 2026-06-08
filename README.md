# NestJS SaaS Starter Template

Multi-tenant SaaS backend starter built with NestJS, TypeORM, and PostgreSQL. Includes organizations (tenants), team membership, subscription plans, and tenant-scoped auth out of the box.

## Features

- **Multi-tenancy** — shared-database model with row-level `tenant_id` isolation
- **Organizations** — users can belong to multiple tenants with roles (`owner`, `admin`, `member`)
- **Subscription plans** — seeded Free, Pro, and Enterprise plans with feature limits
- **JWT auth** — access + refresh tokens with tenant context baked in
- **Seat limits** — enforced per plan when inviting members
- **Stripe-ready** — `externalCustomerId` / `externalSubscriptionId` fields on subscriptions

## Quick start

```bash
pnpm install
cp .env.example .env   # configure DATABASE_URL, JWT_SECRET, CLIENT_URL
pnpm migration:run     # apply database migrations
pnpm start:dev
```

Swagger docs (development only): [http://localhost:3000/docs](http://localhost:3000/docs)

Health check: [http://localhost:3000/health](http://localhost:3000/health)

## Architecture

```
User ──< TenantMember >── Tenant ──< Subscription >── Plan
```

| Concept | Description |
|---------|-------------|
| **User** | Global account (email/password) |
| **Tenant** | Organization / workspace |
| **TenantMember** | User ↔ Tenant link with role |
| **Plan** | Product tier (free, pro, enterprise) |
| **Subscription** | Active plan for a tenant |

### Tenant context

Protected tenant routes require either:

- `X-Tenant-Id` header, or
- `tenantId` claim in the JWT (set on login / via `POST /auth/switch-tenant`)

Use the `@TenantAuth()` decorator on controllers that need tenant isolation.

### Building tenant-scoped resources

Extend `TenantScopedEntity` for any entity that belongs to a tenant:

```typescript
@Entity('projects')
export class Project extends TenantScopedEntity {
  // always filter by tenantId in queries
}
```

## API overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/auth/register` | Sign up + create org + free trial |
| POST | `/api/v1/auth/login` | Login (auto-selects first tenant) |
| POST | `/api/v1/auth/switch-tenant` | Switch active tenant |
| GET | `/api/v1/plans` | List subscription plans |
| GET | `/api/v1/tenants` | List user's tenants |
| GET | `/api/v1/tenants/current` | Current tenant (requires tenant context) |
| GET | `/api/v1/subscriptions/current` | Current tenant subscription |
| PATCH | `/api/v1/subscriptions/change-plan` | Upgrade/downgrade plan |

## Plans (seeded on startup)

| Plan | Price/mo | Seats | API calls/mo |
|------|----------|-------|--------------|
| Free | $0 | 3 | 1,000 |
| Pro | $29 | 10 | 50,000 |
| Enterprise | $99 | Unlimited | Unlimited |

## Environment variables

```env
NODE_ENV=development          # use "production" in prod (disables Swagger)
RUN_MIGRATIONS=false          # set "true" in prod to auto-run migrations on boot
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
CLIENT_URL=http://localhost:5173
PORT=3000
```

## Production checklist

- Set `NODE_ENV=production` in prod — disables Swagger
- Set `RUN_MIGRATIONS=true` in prod — auto-runs pending migrations on boot (off by default locally)
- Never enable TypeORM `synchronize` — use `pnpm migration:run` instead
- Helmet security headers are applied globally
- Graceful shutdown closes DB connections on `SIGTERM` / `SIGINT`
- Monitor `/health` for liveness/readiness probes

## Database migrations

```bash
pnpm migration:run      # apply pending migrations
pnpm migration:revert   # revert last migration
pnpm migration:generate src/database/migrations/MyMigration  # generate from entity changes
```

## Next steps

- Wire [Stripe](https://stripe.com) webhooks to `SubscriptionsService`
- Add email invitations for members
- Add `@RequiresSubscription()` on premium features
- Add per-tenant database schema strategy if needed at scale
