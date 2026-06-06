import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/users.entity';
import { TokenModule } from '../../core/accessControl/token/token.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]) , TokenModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
