import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TokenService } from "./token.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Token } from "./entity/tokens.entity";

@Module({
  imports: [
    ConfigModule, // Import ConfigModule to use ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule], // Make ConfigModule available for this factory
      inject: [ConfigService], // Inject ConfigService to access environment variables
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "24h" },
      }),
    }),
    TypeOrmModule.forFeature([Token]),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
