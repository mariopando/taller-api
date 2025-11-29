/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Post, Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from '../services/payments.service';
import type { CreatePaymentDto } from '../../common/dto/create-payment.dto';
import type {
  ConfirmPaymentRequestDto,
  RefundPaymentRequestDto,
} from '../../common/dto/payment-request.dto';
import type {
  PaymentResponseDto,
  PaymentCallbackDto,
} from '../../common/dto/payment-response.dto';
import {
  PaymentStatus,
  PaymentProvider,
} from '../../common/enums/payment-provider.enum';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject(PaymentsService)
    private paymentsService: PaymentsService,
  ) {}

  @Post('initialize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initialize a new payment transaction' })
  @ApiResponse({
    status: 200,
    description: 'Payment initialized successfully',
    schema: {
      example: {
        transactionId: 'TXN_1234567890_abc123',
        provider: 'transbank',
        redirectUrl: 'https://payment-provider.com/checkout',
        token: 'token_123',
        message: 'Payment initialized successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  @ApiResponse({ status: 402, description: 'Payment provider error' })
  async initializePayment(createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm payment after customer completes the transaction',
  })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 402, description: 'Payment provider error' })
  async confirmPayment(
    confirmPaymentDto: ConfirmPaymentRequestDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.confirmPayment(
      confirmPaymentDto.transactionId,
      confirmPaymentDto.token,
      confirmPaymentDto.provider,
    );
  }

  @Get('status/:transactionId')
  @ApiOperation({ summary: 'Get payment status by transaction ID' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID' })
  @ApiQuery({
    name: 'provider',
    enum: PaymentProvider,
    description: 'Payment provider',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentStatus(
    transactionId: string,
    provider: PaymentProvider,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.getPaymentStatus(transactionId, provider);
  }

  @Post('refund/:transactionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a captured payment' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Cannot refund this payment' })
  async refundPayment(
    transactionId: string,
    refundPaymentDto: RefundPaymentRequestDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.refundPayment(
      transactionId,
      refundPaymentDto.provider,
      refundPaymentDto.amount,
    );
  }

  @Post('webhook/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive payment provider callbacks/webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  async handleCallback(callbackData: PaymentCallbackDto) {
    const result = await this.paymentsService.handleCallback(callbackData);
    return {
      success: true,
      message: 'Webhook processed',
      paymentId: result.id,
    };
  }

  @Get('list')
  @ApiOperation({ summary: 'List payments with optional status filter' })
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async listPayments(
    status?: PaymentStatus,
    limit?: number,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentsService.listPayments(status, limit || 10);
  }
}
