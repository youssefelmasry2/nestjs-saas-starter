import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TokenModule } from '../../core/accessControl/token/token.module';

@Module({
  imports: [ UsersModule , TokenModule],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
