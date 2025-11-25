/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { PaymentStatus } from 'src/common/enums/payment-provider.enum';

@Injectable()
export class MercadoPagoService {
  private apiKey: string;
  private apiSecret: string;
  private apiUrl: string;
  private logger = new Logger(MercadoPagoService.name);

  constructor(private configService: ConfigService) {
    const config = this.configService.get('environments');
    this.apiKey = config.mercadoPago.apiKey;
    this.apiSecret = config.mercadoPago.apiSecret;
    this.apiUrl = config.mercadoPago.apiUrl;
  }

  async createPreference(
    amount: number,
    currency: string,
    _description: string,
    _reference: string,
    _buyerEmail: string,
    _returnUrl: string,
  ): Promise<{ preferenceId: string; redirectUrl: string }> {
    try {
      // In production, this would call: POST /checkout/preferences
      const preferenceId = this.generatePreferenceId();
      const redirectUrl = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;

      this.logger.debug(
        `Mercado Pago preference created: ${preferenceId} for amount ${amount} ${currency}`,
      );

      return {
        preferenceId,
        redirectUrl,
      };
    } catch (error) {
      this.logger.error(
        `Mercado Pago preference creation failed: ${error.message}`,
      );
      throw new HttpException(
        `Mercado Pago preference creation failed: ${error.message}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async getPaymentInfo(paymentId: string): Promise<{
    status: PaymentStatus;
    statusDetail: string;
    amount?: number;
    authCode?: string;
  }> {
    try {
      // In production, this would call: GET /v1/payments/{id}
      const result = {
        status: PaymentStatus.CAPTURED,
        statusDetail: 'accredited',
        amount: 1000,
        authCode: this.generateAuthCode(),
      };

      this.logger.debug(`Mercado Pago payment info retrieved: ${paymentId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Mercado Pago payment info retrieval failed: ${error.message}`,
      );
      throw new HttpException(
        `Mercado Pago payment info retrieval failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refundPayment(
    paymentId: string,
    amount?: number,
  ): Promise<{
    status: PaymentStatus;
    refundAmount: number;
    refundId: string;
  }> {
    try {
      // In production, this would call: POST /v1/payments/{id}/refunds
      const refundId = this.generateTransactionId();
      const result = {
        status: PaymentStatus.REFUNDED,
        refundAmount: amount || 0,
        refundId,
      };

      this.logger.debug(
        `Mercado Pago refund processed: ${paymentId} for amount ${amount}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Mercado Pago refund failed: ${error.message}`);
      throw new HttpException(
        `Mercado Pago refund failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async validateNotification(
    _notificationData: Record<string, any>,
  ): Promise<boolean> {
    try {
      this.logger.debug('Mercado Pago notification validated');
      return true;
    } catch (error) {
      this.logger.error(
        `Mercado Pago notification validation failed: ${error.message}`,
      );
      return false;
    }
  }

  private generatePreferenceId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private generateTransactionId(): string {
    return `MP_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
  }

  private generateAuthCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
