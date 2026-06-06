import {
  SetMetadata,
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { TenantMemberRole } from '../../../modules/tenants/entities/tenant-member.entity';

export const TENANT_AUTH_KEY = 'tenantAuth';
export const TENANT_ROLES_KEY = 'tenantRoles';
export const REQUIRES_SUBSCRIPTION_KEY = 'requiresSubscription';

export const TenantAuth = () =>
  applyDecorators(
    SetMetadata(TENANT_AUTH_KEY, true),
    ApiBearerAuth('access-token'),
    ApiHeader({
      name: 'X-Tenant-Id',
      description: 'Active tenant UUID (optional if set in JWT)',
      required: false,
    }),
  );

export const TenantRoles = (...roles: TenantMemberRole[]) =>
  SetMetadata(TENANT_ROLES_KEY, roles);

export const RequiresSubscription = () =>
  SetMetadata(REQUIRES_SUBSCRIPTION_KEY, true);

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);

export const CurrentTenantMember = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantMember;
  },
);

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant?.id ?? request.user?.tenantId;
  },
);
