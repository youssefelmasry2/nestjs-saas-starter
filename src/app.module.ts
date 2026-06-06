import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { TokenModule } from './core/accessControl/token/token.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './core/accessControl/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
        ConfigModule.forRoot({
      isGlobal: true,
    }),
   

 TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',

    url: configService.get<string>('DATABASE_URL'),

   

    autoLoadEntities: true,
    synchronize: true,
  }),
}),
    UsersModule,
    TokenModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
