import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { PaymentStatus } from 'src/common/enums/payment-provider.enum';

@Injectable()
export class TransbankService {
  private apiKey: string;
  private apiSecret: string;
  private commerceId: string;
  private apiUrl: string;
  private logger = new Logger(TransbankService.name);

  constructor(private configService: ConfigService) {
    const config = this.configService.get('environments');
    this.apiKey = config.transbank.apiKey;
    this.apiSecret = config.transbank.apiSecret;
    this.commerceId = config.transbank.commerce;
    this.apiUrl = config.transbank.apiUrl;
  }

  async initializeTransaction(
    amount: number,
    reference: string,
    returnUrl: string,
    buyEmail: string,
    description: string,
  ): Promise<{ transactionId: string; redirectUrl: string }> {
    try {
      const transactionId = this.generateTransactionId();
      const redirectUrl = `${this.apiUrl}/webpay/initTransaction?token=${transactionId}`;

      this.logger.debug(
        `Transbank transaction initialized: ${transactionId} for amount ${amount}`,
      );

      return {
        transactionId,
        redirectUrl,
      };
    } catch (error) {
      this.logger.error(`Transbank initialization failed: ${error.message}`);
      throw new HttpException(
        `Transbank initialization failed: ${error.message}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async confirmTransaction(transactionToken: string): Promise<{
    status: PaymentStatus;
    authCode?: string;
    amount?: number;
    responseCode?: number;
  }> {
    try {
      // In production, this would call: GET /api/webpay/getTransaction
      const result = {
        status: PaymentStatus.CAPTURED,
        authCode: this.generateAuthCode(),
        amount: 1000,
        responseCode: 0, // 0 = success
      };

      this.logger.debug(`Transbank transaction confirmed: ${transactionToken}`);
      return result;
    } catch (error) {
      this.logger.error(`Transbank confirmation failed: ${error.message}`);
      throw new HttpException(
        `Transbank confirmation failed: ${error.message}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async refundTransaction(
    transactionToken: string,
    amount?: number,
  ): Promise<{ status: PaymentStatus; refundAmount: number }> {
    try {
      // In production, this would call: POST /api/webpay/refund
      const result = {
        status: PaymentStatus.REFUNDED,
        refundAmount: amount || 0,
      };

      this.logger.debug(
        `Transbank refund processed: ${transactionToken} for amount ${amount}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Transbank refund failed: ${error.message}`);
      throw new HttpException(
        `Transbank refund failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTransactionStatus(transactionToken: string): Promise<{
    status: PaymentStatus;
    responseCode: number;
    authCode?: string;
  }> {
    try {
      const result = {
        status: PaymentStatus.CAPTURED,
        responseCode: 0,
        authCode: this.generateAuthCode(),
      };

      this.logger.debug(`Transbank status checked: ${transactionToken}`);
      return result;
    } catch (error) {
      this.logger.error(`Transbank status check failed: ${error.message}`);
      throw new HttpException(
        `Transbank status check failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private generateTransactionId(): string {
    return `TBK_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
  }

  private generateAuthCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
