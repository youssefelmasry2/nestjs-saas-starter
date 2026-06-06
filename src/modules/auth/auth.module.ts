import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TokenModule } from '../../core/accessControl/token/token.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [UsersModule, TokenModule, TenantsModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
