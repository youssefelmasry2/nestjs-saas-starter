import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TENANT_AUTH_KEY,
  TENANT_ROLES_KEY,
} from '../decorators/tenant.decorator';
import { TenantMember } from '../../../modules/tenants/entities/tenant-member.entity';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(TenantMember)
    private readonly tenantMemberRepository: Repository<TenantMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresTenant = this.reflector.getAllAndOverride<boolean>(
      TENANT_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresTenant) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.userId) {
      throw new ForbiddenException('Authentication required');
    }

    const tenantId =
      request.headers['x-tenant-id'] ?? user.tenantId;

    if (!tenantId) {
      throw new BadRequestException(
        'Tenant context required. Pass X-Tenant-Id header or switch tenant via auth/switch-tenant.',
      );
    }

    const membership = await this.tenantMemberRepository.findOne({
      where: { tenantId, userId: user.userId },
      relations: ['tenant'],
    });

    if (!membership || !membership.tenant.isActive) {
      throw new ForbiddenException('You do not have access to this tenant');
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      TENANT_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles?.length && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(
        'You do not have the required tenant role',
      );
    }

    request.tenant = membership.tenant;
    request.tenantMember = membership;
    request.user.tenantId = tenantId;
    request.user.tenantRole = membership.role;

    return true;
  }
}
