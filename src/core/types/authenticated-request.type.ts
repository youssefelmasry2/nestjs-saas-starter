import type { Request } from "express";
import type { JwtPayload } from "../accessControl/types/jwt-payload.type";
import type { Tenant } from "../../modules/tenants/entities/tenant.entity";
import type { TenantMember } from "../../modules/tenants/entities/tenant-member.entity";
import type { Subscription } from "../../modules/subscriptions/entities/subscription.entity";

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
  refreshToken?: string;
  tenant?: Tenant;
  tenantMember?: TenantMember;
  subscription?: Subscription;
}
