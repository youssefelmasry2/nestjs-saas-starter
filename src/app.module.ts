import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./core/health/health.module";
import { TokenModule } from "./core/accessControl/token/token.module";
import { TenantContextModule } from "./core/tenant/tenant-context.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PlansModule } from "./modules/plans/plans.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("DATABASE_URL"),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [join(__dirname, "database/migrations/*{.ts,.js}")],
        migrationsRun: configService.get("RUN_MIGRATIONS") === "true",
      }),
    }),
    HealthModule,
    UsersModule,
    TokenModule,
    PlansModule,
    SubscriptionsModule,
    TenantsModule,
    AuthModule,
    TenantContextModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
