import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonLoggerService } from './monitoring/logger/winston.service';
import { createNamespace } from 'cls-hooked';

async function bootstrap() {
  // Initialize CLS namespace for request context
  createNamespace('request-context');

  const app = await NestFactory.create(AppModule, {
    logger: false, // Disable default logger
  });

  // Use our custom Winston logger
  const winstonLogger = app.get(WinstonLoggerService);
  app.useLogger(winstonLogger);

  // Enable global validation pipes
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Plotting Jadwal Dosen API')
    .setDescription('API for managing lecturer schedules and users')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('Monitoring', 'Health checks and metrics')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
