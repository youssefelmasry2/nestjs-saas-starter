import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { ChangePlanDto } from './dto/subscriptions.dto';
import {
  TenantAuth,
  TenantRoles,
  CurrentTenant,
} from '../../core/tenant/decorators/tenant.decorator';
import { TenantMemberRole } from '../tenants/entities/tenant-member.entity';
import { AccessAuth } from '../../core/accessControl/decorator/common.decorator';
import { Tenant } from '../tenants/entities/tenant.entity';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('current')
  @AccessAuth()
  @TenantAuth()
  @ApiOperation({ summary: 'Get current tenant subscription' })
  getCurrent(@CurrentTenant() tenant: Tenant) {
    return this.subscriptionsService.getTenantSubscription(tenant.id);
  }

  @Patch('change-plan')
  @AccessAuth()
  @TenantAuth()
  @TenantRoles(TenantMemberRole.OWNER, TenantMemberRole.ADMIN)
  @ApiOperation({ summary: 'Change subscription plan (Stripe-ready stub)' })
  changePlan(
    @CurrentTenant() tenant: Tenant,
    @Body() dto: ChangePlanDto,
  ) {
    return this.subscriptionsService.changePlan(tenant.id, dto);
  }

  @Post('cancel')
  @AccessAuth()
  @TenantAuth()
  @TenantRoles(TenantMemberRole.OWNER)
  @ApiOperation({ summary: 'Cancel subscription at period end' })
  cancel(@CurrentTenant() tenant: Tenant) {
    return this.subscriptionsService.cancelSubscription(tenant.id);
  }
}
