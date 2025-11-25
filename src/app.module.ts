import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PaymentsModule } from "@/payments/payments.module"
import { environments } from "@/config/environments"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [environments],
      envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService) => {
        const env = configService.get("environments")
        return {
          type: "postgres",
          host: env.db.host,
          port: env.db.port,
          username: env.db.username,
          password: env.db.password,
          database: env.db.name,
          entities: [__dirname + "/**/*.entity{.ts,.js}"],
          synchronize: env.app.env === "local",
          logging: env.app.env !== "prod",
        }
      },
      inject: ["ConfigService"],
    }),
    PaymentsModule,
  ],
})
export class AppModule {}
