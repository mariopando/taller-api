import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  IsObject,
  Min,
  IsPositive,
} from 'class-validator';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Amount to be charged',
    example: 100.5,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'CLP',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Payment provider',
    enum: PaymentProvider,
    example: PaymentProvider.TRANSBANK,
  })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty({
    description: 'Order or transaction reference ID',
    example: 'ORD-123456',
  })
  @IsString()
  reference: string;

  @ApiProperty({
    description: 'Description of the payment',
    example: 'Product purchase',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'customer@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Customer phone',
    example: '+56912345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Return URL after payment',
    example: 'https://yourapp.com/payment-result',
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiPropertyOptional({
    description: 'Webhook notification URL',
    example: 'https://yourapp.com/webhook',
  })
  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
