import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { TenantMember } from '../../modules/tenants/entities/tenant-member.entity';
import { TenantGuard } from './guards/tenant.guard';
import { SubscriptionGuard } from './guards/subscription.guard';
import { SubscriptionsModule } from '../../modules/subscriptions/subscriptions.module';
import { TokenModule } from '../accessControl/token/token.module';
import { JwtAuthGuard } from '../accessControl/guards/jwt-auth.guard';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([TenantMember]),
    SubscriptionsModule,
    TokenModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_GUARD, useClass: SubscriptionGuard },
  ],
})
export class TenantContextModule {}
