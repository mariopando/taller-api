import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"
import { ConfigService } from "@nestjs/config"

async function setupApplication(app) {
  const configService = app.get(ConfigService)
  const env = configService.get("environments")

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.enableCors({
    origin: env.cors.origins,
    credentials: env.cors.credentials,
    methods: env.cors.allowedMethods,
    allowedHeaders: env.cors.allowedHeaders,
  })

  app.setGlobalPrefix(env.app.apiPrefix)

  if (env.swagger.enabled) {
    const config = new DocumentBuilder()
      .setTitle("Payment Gateway API")
      .setDescription("Payment Gateway for Transbank and Mercado Pago Integration")
      .setVersion("1.0.0")
      .addBearerAuth()
      .addTag("Payments", "Payment processing endpoints")
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup(env.swagger.path, app, document)
  }

  return env
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const env = await setupApplication(app)

  const port = env.app.port
  await app.listen(port, () => {
    console.log(`
╔════════════════════════════════════════════╗
║  Payment Gateway API                       ║
║  Environment: ${env.app.env.padEnd(26, " ")}║
║  Port: ${port.toString().padEnd(29, " ")}║
║  API Prefix: ${env.app.apiPrefix.padEnd(22, " ")}║
║  Context: ${env.app.context.padEnd(26, " ")}║
╚════════════════════════════════════════════╝
    `)
  })
}

bootstrap()
