import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmPaymentRequestDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: 'TXN_1234567890_abc',
  })
  @IsString()
  transactionId: string;

  @ApiProperty({
    description: 'Payment token from provider',
    example: 'token_123',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Payment provider',
    enum: PaymentProvider,
  })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;
}

export class RefundPaymentRequestDto {
  @ApiProperty({
    description: 'Payment provider',
    enum: PaymentProvider,
  })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiPropertyOptional({
    description: 'Refund amount (optional, full amount if not provided)',
    example: 50.0,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;
}
