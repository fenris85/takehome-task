import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Get CORS origins from config
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '');
  const origins = corsOrigins.split(',').map(origin => origin.trim());

  // Enable CORS for frontend
  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Add global prefix
  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT', 8080);
  await app.listen(port);
  
  logger.log(`Application is running on port ${port}`);
  logger.log(`Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
  logger.log(`CORS Origins: ${origins.join(', ')}`);
}

bootstrap().catch(error => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
