import { registerAs } from "@nestjs/config"

export const environments = registerAs("environments", () => ({
  app: {
    env: process.env.APP_STAGE || "local",
    port: Number(process.env.PORT) || 8080,
    apiPrefix: process.env.API_PREFIX || "api",
    context: process.env.CONTEXT || "v1",
  },
  cors: {
    enabled: process.env.CORS_ENABLED === "true",
    credentials: process.env.CORS_CREDENTIALS === "true",
    origins: (process.env.ORIGINS || "http://localhost:3000").split(","),
    allowedHeaders: (process.env.ALLOWED_HEADERS || "Content-Type,Authorization").split(","),
    allowedMethods: (process.env.ALLOWED_METHODS || "GET,POST,PUT,DELETE,PATCH").split(","),
  },
  swagger: {
    path: process.env.SWAGGER_PATH || "docs",
    enabled: process.env.SWAGGER_ENABLED === "true",
  },
  db: {
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME || "payment_gateway",
    synchronize: process.env.DATABASE_SYNCHRONIZE === "true",
    logging: process.env.DATABASE_LOGGING === "true",
  },
  transbank: {
    apiKey: process.env.TRANSBANK_API_KEY,
    apiSecret: process.env.TRANSBANK_API_SECRET,
    commerceId: process.env.TRANSBANK_COMMERCE_ID,
    apiUrl: process.env.TRANSBANK_API_URL || "https://webpay3g.transbank.cl/api",
  },
  mercadoPago: {
    apiKey: process.env.MERCADO_PAGO_API_KEY,
    apiSecret: process.env.MERCADO_PAGO_API_SECRET,
    apiUrl: process.env.MERCADO_PAGO_API_URL || "https://api.mercadopago.com",
  },
}))
