import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TrimPipe } from './common/pipes/trim.pipe';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());      
  app.useGlobalInterceptors(new TransformInterceptor());    
  app.useGlobalFilters(new HttpExceptionFilter());
  const config = new DocumentBuilder()
  .setTitle('MiniShop API')
  .setDescription('REST API для навчального інтернет-магазину. Автентифікація через JWT Bearer token.')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
  await app.listen(3000);
}
bootstrap();