import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    // Enable CORS
    app.enableCors({
      origin: process.env.CLIENT_URL, // Allow requests from your frontend
      credentials: true, // Allow cookies and credentials
    });
    app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

     app.setGlobalPrefix('api/v1');

  
  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('SaaS API')
    .setDescription('Multi-tenant SaaS starter API with subscription plans')
    .setVersion('1.0')
.addBearerAuth(
  { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
  'access-token',
)
.addBearerAuth(
  { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
  'refresh-token',
)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
