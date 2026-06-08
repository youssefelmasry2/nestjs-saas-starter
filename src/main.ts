import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { isDevelopment } from "./config/env";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.enableShutdownHooks();
  app.use(helmet());

  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix("api/v1", { exclude: ["health"] });

  if (isDevelopment()) {
    const config = new DocumentBuilder()
      .setTitle("SaaS API")
      .setDescription("Multi-tenant SaaS starter API with subscription plans")
      .setVersion("1.0")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        "access-token",
      )
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        "refresh-token",
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start application", error);
  process.exit(1);
});
