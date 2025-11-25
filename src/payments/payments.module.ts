import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './services/payments.service';
import { PaymentsController } from './controllers/payments.controller';
import { Payment } from './entities/payment.entity';
import { PaymentRepository } from './repositories/payment.repository';
import { TransbankService } from './providers/transbank.service';
import { MercadoPagoService } from './providers/mercado-pago.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentRepository,
    TransbankService,
    MercadoPagoService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
