import {
  SetMetadata,
  applyDecorators,
  createParamDecorator,
  InternalServerErrorException,
  type ExecutionContext,
} from "@nestjs/common";
import { ApiBearerAuth, ApiHeader } from "@nestjs/swagger";
import type { TenantMemberRole } from "../../../modules/tenants/entities/tenant-member.entity";
import type { Tenant } from "../../../modules/tenants/entities/tenant.entity";
import type { TenantMember } from "../../../modules/tenants/entities/tenant-member.entity";
import type { AuthenticatedRequest } from "../../types/authenticated-request.type";

export const TENANT_AUTH_KEY = "tenantAuth";
export const TENANT_ROLES_KEY = "tenantRoles";
export const REQUIRES_SUBSCRIPTION_KEY = "requiresSubscription";

export const TenantAuth = () =>
  applyDecorators(
    SetMetadata(TENANT_AUTH_KEY, true),
    ApiBearerAuth("access-token"),
    ApiHeader({
      name: "X-Tenant-Id",
      description: "Active tenant UUID (optional if set in JWT)",
      required: false,
    }),
  );

export const TenantRoles = (...roles: TenantMemberRole[]) =>
  SetMetadata(TENANT_ROLES_KEY, roles);

export const RequiresSubscription = () =>
  SetMetadata(REQUIRES_SUBSCRIPTION_KEY, true);

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Tenant => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.tenant) {
      throw new InternalServerErrorException("Tenant context missing");
    }
    return request.tenant;
  },
);

export const CurrentTenantMember = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantMember => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.tenantMember) {
      throw new InternalServerErrorException("Tenant member context missing");
    }
    return request.tenantMember;
  },
);

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.tenant?.id ?? request.user.tenantId;
  },
);
