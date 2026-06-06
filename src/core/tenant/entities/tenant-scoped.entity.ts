import { Column, Index } from 'typeorm';

/**
 * Extend this base class for any entity that belongs to a single tenant.
 * Always filter queries by tenantId to enforce row-level isolation.
 */
export abstract class TenantScopedEntity {
  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;
}
