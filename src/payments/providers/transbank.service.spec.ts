/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TransbankService } from './transbank.service';
import { PaymentStatus } from 'src/common/enums/payment-provider.enum';
import { jest } from '@jest/globals';

describe('TransbankService', () => {
  let service: TransbankService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransbankService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              transbank: {
                apiKey: 'test_key',
                apiSecret: 'test_secret',
                commerce: 'test_commerce',
                apiUrl: 'https://webpay3g.transbank.cl/api',
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TransbankService>(TransbankService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeTransaction', () => {
    it('should initialize a transaction successfully', async () => {
      const result = await service.initializeTransaction(
        100.5,
        'ORD-123456',
        'http://localhost:3000/result',
        'test@example.com',
        'Test payment',
      );

      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('redirectUrl');
      expect(result.transactionId).toMatch(/^TBK_/);
      expect(result.redirectUrl).toContain('webpay3g.transbank.cl');
    });
  });

  describe('confirmTransaction', () => {
    it('should confirm transaction successfully', async () => {
      const result = await service.confirmTransaction('TOKEN_123');

      expect(result.status).toBe(PaymentStatus.CAPTURED);
      expect(result).toHaveProperty('authCode');
      expect(result).toHaveProperty('amount');
      expect(result.responseCode).toBe(0);
    });
  });

  describe('refundTransaction', () => {
    it('should refund transaction successfully', async () => {
      const result = await service.refundTransaction('TOKEN_123', 100.5);

      expect(result.status).toBe(PaymentStatus.REFUNDED);
      expect(result.refundAmount).toBe(100.5);
    });

    it('should refund without amount parameter', async () => {
      const result = await service.refundTransaction('TOKEN_123');

      expect(result.status).toBe(PaymentStatus.REFUNDED);
      expect(result.refundAmount).toBe(0);
    });
  });

  describe('getTransactionStatus', () => {
    it('should get transaction status successfully', async () => {
      const result = await service.getTransactionStatus('TOKEN_123');

      expect(result.status).toBe(PaymentStatus.CAPTURED);
      expect(result.responseCode).toBe(0);
      expect(result).toHaveProperty('authCode');
    });
  });
});
