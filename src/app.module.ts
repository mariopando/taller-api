import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsController } from './payments/controllers/payments.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsModule } from './payments/payments.module';
import { PaymentsService } from './payments/services/payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    // TypeOrmModule.forRoot(ConfigService.get('environments').db),
    PaymentsModule,
    TypeOrmModule,
    DataSource,
  ],
  controllers: [AppController, PaymentsController],
  providers: [AppService, ConfigService, PaymentsService],
})
export class AppModule {}
