import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import {
  CreateTenantDto,
  UpdateTenantDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
} from './dto/tenants.dto';
import {
  TenantAuth,
  TenantRoles,
  CurrentTenant,
  CurrentTenantMember,
} from '../../core/tenant/decorators/tenant.decorator';
import { TenantMemberRole } from './entities/tenant-member.entity';
import {
  AccessAuth,
  CurrentUser,
} from '../../core/accessControl/decorator/common.decorator';
import { Tenant } from './entities/tenant.entity';
import { TenantMember } from './entities/tenant-member.entity';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @AccessAuth()
  @ApiOperation({ summary: 'List tenants the current user belongs to' })
  listMine(@CurrentUser() user: { userId: string }) {
    return this.tenantsService.findUserTenants(user.userId);
  }

  @Post()
  @AccessAuth()
  @ApiOperation({ summary: 'Create a new tenant (user becomes owner)' })
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateTenantDto,
  ) {
    return this.tenantsService.create(user.userId, dto);
  }

  @Get('current')
  @AccessAuth()
  @TenantAuth()
  @ApiOperation({ summary: 'Get current tenant details' })
  getCurrent(@CurrentTenant() tenant: Tenant) {
    return tenant;
  }

  @Patch('current')
  @AccessAuth()
  @TenantAuth()
  @TenantRoles(TenantMemberRole.OWNER, TenantMemberRole.ADMIN)
  @ApiOperation({ summary: 'Update current tenant' })
  updateCurrent(
    @CurrentTenant() tenant: Tenant,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(tenant.id, dto);
  }

  @Get('current/members')
  @AccessAuth()
  @TenantAuth()
  @ApiOperation({ summary: 'List members of current tenant' })
  listMembers(@CurrentTenant() tenant: Tenant) {
    return this.tenantsService.getMembers(tenant.id);
  }

  @Post('current/members/invite')
  @AccessAuth()
  @TenantAuth()
  @TenantRoles(TenantMemberRole.OWNER, TenantMemberRole.ADMIN)
  @ApiOperation({ summary: 'Invite a user to the current tenant' })
  inviteMember(
    @CurrentTenant() tenant: Tenant,
    @CurrentTenantMember() member: TenantMember,
    @Body() dto: InviteMemberDto,
  ) {
    return this.tenantsService.inviteMember(tenant.id, dto, member.role);
  }

  @Patch('current/members/:memberId/role')
  @AccessAuth()
  @TenantAuth()
  @TenantRoles(TenantMemberRole.OWNER)
  @ApiOperation({ summary: 'Update a member role' })
  updateMemberRole(
    @CurrentTenant() tenant: Tenant,
    @CurrentTenantMember() actor: TenantMember,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.tenantsService.updateMemberRole(
      tenant.id,
      memberId,
      dto,
      actor.role,
    );
  }

  @Delete('current/members/:memberId')
  @AccessAuth()
  @TenantAuth()
  @ApiOperation({ summary: 'Remove a member from the current tenant' })
  removeMember(
    @CurrentTenant() tenant: Tenant,
    @CurrentTenantMember() actor: TenantMember,
    @CurrentUser() user: { userId: string },
    @Param('memberId') memberId: string,
  ) {
    return this.tenantsService.removeMember(
      tenant.id,
      memberId,
      user.userId,
      actor.role,
    );
  }
}
