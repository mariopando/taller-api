import type {
  PaymentStatus,
  PaymentProvider,
} from '../enums/payment-provider.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Unique payment identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Payment provider',
    enum: ['transbank', 'mercado_pago'],
    example: 'transbank',
  })
  provider: PaymentProvider;

  @ApiProperty({
    description: 'Payment amount',
    example: 100.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'CLP',
  })
  currency: string;

  @ApiProperty({
    description: 'Current payment status',
    enum: [
      'pending',
      'authorized',
      'captured',
      'declined',
      'cancelled',
      'refunded',
      'error',
    ],
    example: 'captured',
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Provider transaction ID',
    example: 'TXN_1234567890_abc',
  })
  transactionId: string;

  @ApiPropertyOptional({
    description: 'Authorization code from provider',
    example: 'AUTH123',
  })
  authCode?: string;

  @ApiPropertyOptional({
    description: 'Response message',
    example: 'Payment captured successfully',
  })
  message?: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: Date;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  metadata?: Record<string, any>;
}

export class PaymentInitializationDto {
  @ApiProperty({
    description: 'Internal transaction ID',
    example: 'TXN_1234567890_abc',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Payment provider',
    enum: ['transbank', 'mercado_pago'],
  })
  provider: PaymentProvider;

  @ApiProperty({
    description: 'Payment provider redirect URL',
    example: 'https://payment-provider.com/checkout',
  })
  redirectUrl?: string;

  @ApiProperty({
    description: 'Payment token from provider',
    example: 'token_123',
  })
  token?: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Payment initialized successfully',
  })
  message?: string;
}

export class PaymentCallbackDto {
  @ApiProperty({
    description: 'Payment provider',
    enum: ['transbank', 'mercado_pago'],
  })
  provider: PaymentProvider;

  @ApiProperty({
    description: 'Transaction ID',
    example: 'TXN_1234567890_abc',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Payment status after provider processing',
    enum: [
      'pending',
      'authorized',
      'captured',
      'declined',
      'cancelled',
      'refunded',
      'error',
    ],
  })
  status: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Authorization code',
  })
  authCode?: string;

  @ApiPropertyOptional({
    description: 'Final payment amount',
  })
  amount?: number;

  @ApiPropertyOptional({
    description: 'Callback message',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Provider-specific metadata',
  })
  metadata?: Record<string, any>;
}

export class PaymentErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid payment data',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Detailed error information',
  })
  details?: Record<string, any>;

  @ApiProperty({
    description: 'Timestamp when error occurred',
  })
  timestamp: string;
}
