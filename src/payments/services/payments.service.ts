import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { CreatePaymentDto } from 'src/common/dto/create-payment.dto';
import type {
  PaymentResponseDto,
  PaymentInitializationDto,
  PaymentCallbackDto,
} from 'src/common/dto/payment-response.dto';
import {
  PaymentStatus,
  PaymentProvider,
} from 'src/common/enums/payment-provider.enum';
import type { PaymentRepository } from '../repositories/payment.repository';
import type { TransbankService } from '../providers/transbank.service';
import type { MercadoPagoService } from '../providers/mercado-pago.service';
import { Payment } from '../entities/payment.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    private paymentRepository: PaymentRepository,
    private transbankService: TransbankService,
    private mercadoPagoService: MercadoPagoService,
  ) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentInitializationDto> {
    const payment = new Payment();
    payment.id = uuidv4();
    payment.provider = createPaymentDto.provider;
    payment.amount = createPaymentDto.amount;
    payment.currency = createPaymentDto.currency;
    payment.reference = createPaymentDto.reference;
    payment.description = createPaymentDto.description;
    payment.email = createPaymentDto.email;
    payment.phone = createPaymentDto.phone;
    payment.returnUrl = createPaymentDto.returnUrl;
    payment.webhookUrl = createPaymentDto.webhookUrl;
    payment.metadata = createPaymentDto.metadata;
    payment.transactionId = this.generateTransactionId();
    payment.status = PaymentStatus.PENDING;

    const savedPayment = await this.paymentRepository.save(payment);

    // Initialize transaction with the selected provider
    let redirectUrl: string;
    let token: string;

    if (createPaymentDto.provider === PaymentProvider.TRANSBANK) {
      const transbankResult = await this.transbankService.initializeTransaction(
        createPaymentDto.amount,
        savedPayment.reference,
        createPaymentDto.returnUrl || 'http://localhost:3000/payment-result',
        createPaymentDto.email,
        createPaymentDto.description,
      );

      redirectUrl = transbankResult.redirectUrl;
      token = transbankResult.transactionId;
    } else if (createPaymentDto.provider === PaymentProvider.MERCADO_PAGO) {
      const mpResult = await this.mercadoPagoService.createPreference(
        createPaymentDto.amount,
        createPaymentDto.currency,
        createPaymentDto.description,
        savedPayment.reference,
        createPaymentDto.email,
        createPaymentDto.returnUrl || 'http://localhost:3000/payment-result',
      );

      redirectUrl = mpResult.redirectUrl;
      token = mpResult.preferenceId;
    }

    // Update payment with provider token
    await this.paymentRepository.update(savedPayment.id, {
      status: PaymentStatus.AUTHORIZED,
    });

    return {
      transactionId: savedPayment.transactionId,
      provider: createPaymentDto.provider,
      redirectUrl,
      token,
      message: 'Payment initialized successfully',
    };
  }

  async confirmPayment(
    transactionId: string,
    token: string,
    provider: PaymentProvider,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findByTransactionId(
      transactionId,
      provider,
    );

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    try {
      let result: { status: PaymentStatus; authCode?: string; amount?: number };

      if (provider === PaymentProvider.TRANSBANK) {
        result = await this.transbankService.confirmTransaction(token);
      } else if (provider === PaymentProvider.MERCADO_PAGO) {
        result = await this.mercadoPagoService.getPaymentInfo(token);
      }

      // Update payment with confirmation result
      const updatedPayment = await this.paymentRepository.updatePaymentStatus(
        payment.id,
        result.status,
        result.authCode,
        JSON.stringify(result),
      );

      return this.mapPaymentToResponse(updatedPayment);
    } catch (error) {
      await this.paymentRepository.updatePaymentStatus(
        payment.id,
        PaymentStatus.ERROR,
        null,
        error.message,
      );
      throw error;
    }
  }

  async getPaymentStatus(
    transactionId: string,
    provider: PaymentProvider,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findByTransactionId(
      transactionId,
      provider,
    );

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.mapPaymentToResponse(payment);
  }

  async refundPayment(
    transactionId: string,
    provider: PaymentProvider,
    amount?: number,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findByTransactionId(
      transactionId,
      provider,
    );

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.CAPTURED) {
      throw new BadRequestException('Only captured payments can be refunded');
    }

    try {
      let result;

      if (provider === PaymentProvider.TRANSBANK) {
        result = await this.transbankService.refundTransaction(
          payment.transactionId,
          amount || payment.amount,
        );
      } else if (provider === PaymentProvider.MERCADO_PAGO) {
        result = await this.mercadoPagoService.refundPayment(
          payment.transactionId,
          amount || payment.amount,
        );
      }

      const updatedPayment = await this.paymentRepository.updatePaymentStatus(
        payment.id,
        PaymentStatus.REFUNDED,
        null,
        JSON.stringify(result),
      );

      return this.mapPaymentToResponse(updatedPayment);
    } catch (error) {
      throw new BadRequestException(`Refund failed: ${error.message}`);
    }
  }

  async handleCallback(callbackData: PaymentCallbackDto): Promise<Payment> {
    const payment = await this.paymentRepository.findByTransactionId(
      callbackData.transactionId,
      callbackData.provider,
    );

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.paymentRepository.updatePaymentStatus(
      payment.id,
      callbackData.status,
      callbackData.authCode,
      JSON.stringify(callbackData.metadata),
    );
  }

  async listPayments(
    status?: PaymentStatus,
    limit = 10,
  ): Promise<PaymentResponseDto[]> {
    let payments: Payment[];

    if (status) {
      payments = await this.paymentRepository.findByStatus(status, limit);
    } else {
      payments = await this.paymentRepository.find({
        take: limit,
        order: { createdAt: 'DESC' },
      });
    }

    return payments.map((payment) => this.mapPaymentToResponse(payment));
  }

  private mapPaymentToResponse(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      provider: payment.provider,
      amount: Number.parseFloat(payment.amount.toString()),
      currency: payment.currency,
      status: payment.status,
      transactionId: payment.transactionId,
      authCode: payment.authCode,
      message: `Payment ${payment.status}`,
      timestamp: payment.updatedAt,
      metadata: payment.metadata,
    };
  }

  private generateTransactionId(): string {
    return `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
