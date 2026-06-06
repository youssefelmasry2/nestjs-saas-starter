import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantMember } from './entities/tenant-member.entity';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, TenantMember]),
    SubscriptionsModule,
    UsersModule,
  ],
  providers: [TenantsService],
  controllers: [TenantsController],
  exports: [TenantsService],
})
export class TenantsModule {}
