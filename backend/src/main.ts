import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Validaciones globales ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // --- Configuración de swagger ---
  const config = new DocumentBuilder()
    .setTitle('API REST - Prueba Técnica para GlobalThink Technology S.A.')
    .setDescription('Documentación de los endpoints de Usuarios y Perfiles')
    .setVersion('1.0')
    .addBearerAuth() // Lo dejamos preparado para el módulo de Auth que viene después
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // La ruta donde se verá la documentación será http://localhost:3000/api/docs
  SwaggerModule.setup('api/docs', app, document);

  // Conección al puerto
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
