import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsService } from './services/payments.service';
import { PaymentsController } from './controllers/payments.controller';
import { Payment } from './entities/payment.entity';
import { PaymentRepository } from './repositories/payment.repository';
import { TransbankService } from './providers/transbank.service';
import { MercadoPagoService } from './providers/mercado-pago.service';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), ConfigModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    {
      provide: PaymentRepository,
      useFactory: (dataSource: DataSource) => new PaymentRepository(dataSource),
      inject: [getDataSourceToken()],
    },
    {
      provide: TransbankService,
      useFactory: (configService: ConfigService) =>
        new TransbankService(configService),
      inject: [ConfigService],
    },
    {
      provide: MercadoPagoService,
      useFactory: (configService: ConfigService) =>
        new MercadoPagoService(configService),
      inject: [ConfigService],
    },
  ],
  exports: [PaymentsService, PaymentRepository],
})
export class PaymentsModule {}
