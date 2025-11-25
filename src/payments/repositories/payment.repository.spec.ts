import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { PaymentRepository } from './payment.repository';
import type { Payment } from '../entities/payment.entity';
import {
  PaymentStatus,
  PaymentProvider,
} from 'src/common/enums/payment-provider.enum';
import { jest } from '@jest/globals';

describe('PaymentRepository', () => {
  let repository: PaymentRepository;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentRepository,
        {
          provide: DataSource,
          useValue: {
            createEntityManager: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<PaymentRepository>(PaymentRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByTransactionId', () => {
    it('should find payment by transaction ID and provider', async () => {
      const payment: Payment = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        transactionId: 'TXN_123',
        provider: PaymentProvider.TRANSBANK,
        amount: 100.5,
        currency: 'CLP',
        status: PaymentStatus.CAPTURED,
        reference: 'ORD-123456',
        description: 'Test payment',
        authCode: 'AUTH123',
        email: 'test@example.com',
        phone: null,
        returnUrl: 'http://localhost:3000/result',
        webhookUrl: null,
        metadata: null,
        providerResponse: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(payment);

      const result = await repository.findByTransactionId(
        'TXN_123',
        PaymentProvider.TRANSBANK,
      );

      expect(result).toEqual(payment);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          transactionId: 'TXN_123',
          provider: PaymentProvider.TRANSBANK,
        },
      });
    });
  });

  describe('findByStatus', () => {
    it('should find payments by status', async () => {
      const payments: Payment[] = [];

      jest.spyOn(repository, 'find').mockResolvedValue(payments);

      const result = await repository.findByStatus(PaymentStatus.PENDING, 10);

      expect(result).toEqual(payments);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const updatedPayment: Payment = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        transactionId: 'TXN_123',
        provider: PaymentProvider.TRANSBANK,
        amount: 100.5,
        currency: 'CLP',
        status: PaymentStatus.CAPTURED,
        reference: 'ORD-123456',
        description: 'Test payment',
        authCode: 'AUTH123',
        email: 'test@example.com',
        phone: null,
        returnUrl: 'http://localhost:3000/result',
        webhookUrl: null,
        metadata: null,
        providerResponse: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest.spyOn(repository, 'findOne').mockResolvedValue(updatedPayment);

      const result = await repository.updatePaymentStatus(
        '123e4567-e89b-12d3-a456-426614174000',
        PaymentStatus.CAPTURED,
        'AUTH123',
      );

      expect(result).toEqual(updatedPayment);
    });
  });
});
