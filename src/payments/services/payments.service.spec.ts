import { Test, type TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { TransbankService } from '../providers/transbank.service';
import { MercadoPagoService } from '../providers/mercado-pago.service';
import {
  PaymentStatus,
  PaymentProvider,
} from 'src/common/enums/payment-provider.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import type { Payment } from '../entities/payment.entity';
import { jest } from '@jest/globals'; // Declare the jest variable

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let transbankService: jest.Mocked<TransbankService>;
  let mercadoPagoService: jest.Mocked<MercadoPagoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PaymentRepository,
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
            findByTransactionId: jest.fn(),
            updatePaymentStatus: jest.fn(),
            findByStatus: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: TransbankService,
          useValue: {
            initializeTransaction: jest.fn(),
            confirmTransaction: jest.fn(),
            refundTransaction: jest.fn(),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            createPreference: jest.fn(),
            getPaymentInfo: jest.fn(),
            refundPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentRepository = module.get(PaymentRepository);
    transbankService = module.get(TransbankService);
    mercadoPagoService = module.get(MercadoPagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment - Transbank', () => {
    it('should create a payment with Transbank provider', async () => {
      const createPaymentDto = {
        amount: 100.5,
        currency: 'CLP',
        provider: PaymentProvider.TRANSBANK,
        reference: 'ORD-123456',
        description: 'Test payment',
        email: 'test@example.com',
        returnUrl: 'http://localhost:3000/result',
      };

      const savedPayment: Payment = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        transactionId: 'TXN_1234567890_abc',
        ...createPaymentDto,
        status: PaymentStatus.PENDING,
        authCode: null,
        phone: null,
        webhookUrl: null,
        metadata: null,
        providerResponse: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      paymentRepository.save.mockResolvedValue(savedPayment);
      paymentRepository.update.mockResolvedValue(undefined);
      transbankService.initializeTransaction.mockResolvedValue({
        transactionId: 'TBK_123',
        redirectUrl: 'https://transbank.com/pay',
      });

      const result = await service.createPayment(createPaymentDto);

      expect(result.provider).toBe(PaymentProvider.TRANSBANK);
      expect(result.redirectUrl).toBe('https://transbank.com/pay');
      expect(transbankService.initializeTransaction).toHaveBeenCalled();
    });
  });

  describe('createPayment - Mercado Pago', () => {
    it('should create a payment with Mercado Pago provider', async () => {
      const createPaymentDto = {
        amount: 50.0,
        currency: 'ARS',
        provider: PaymentProvider.MERCADO_PAGO,
        reference: 'ORD-654321',
        description: 'Test MP payment',
        email: 'test@example.com',
        returnUrl: 'http://localhost:3000/result',
      };

      const savedPayment: Payment = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        transactionId: 'TXN_1234567891_def',
        ...createPaymentDto,
        status: PaymentStatus.PENDING,
        authCode: null,
        phone: null,
        webhookUrl: null,
        metadata: null,
        providerResponse: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      paymentRepository.save.mockResolvedValue(savedPayment);
      paymentRepository.update.mockResolvedValue(undefined);
      mercadoPagoService.createPreference.mockResolvedValue({
        preferenceId: 'MP_PREF_123',
        redirectUrl: 'https://mercadopago.com/checkout',
      });

      const result = await service.createPayment(createPaymentDto);

      expect(result.provider).toBe(PaymentProvider.MERCADO_PAGO);
      expect(result.redirectUrl).toBe('https://mercadopago.com/checkout');
      expect(mercadoPagoService.createPreference).toHaveBeenCalled();
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a Transbank payment', async () => {
      const transactionId = 'TXN_123';
      const token = 'TOKEN_123';
      const provider = PaymentProvider.TRANSBANK;

      const payment: Payment = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        transactionId,
        provider,
        amount: 100.5,
        currency: 'CLP',
        status: PaymentStatus.AUTHORIZED,
        reference: 'ORD-123456',
        description: 'Test payment',
        authCode: null,
        email: 'test@example.com',
        phone: null,
        returnUrl: 'http://localhost:3000/result',
        webhookUrl: null,
        metadata: null,
        providerResponse: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      paymentRepository.findByTransactionId.mockResolvedValue(payment);
      transbankService.confirmTransaction.mockResolvedValue({
        status: PaymentStatus.CAPTURED,
        authCode: 'AUTH123',
        amount: 100.5,
      });
      paymentRepository.updatePaymentStatus.mockResolvedValue({
        ...payment,
        status: PaymentStatus.CAPTURED,
        authCode: 'AUTH123',
      });

      const result = await service.confirmPayment(
        transactionId,
        token,
        provider,
      );

      expect(result.status).toBe(PaymentStatus.CAPTURED);
      expect(result.authCode).toBe('AUTH123');
      expect(transbankService.confirmTransaction).toHaveBeenCalledWith(token);
    });

    it('should throw NotFoundException when payment does not exist', async () => {
      paymentRepository.findByTransactionId.mockResolvedValue(null);

      await expect(
        service.confirmPayment(
          'INVALID_TXN',
          'TOKEN',
          PaymentProvider.TRANSBANK,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status', async () => {
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

      paymentRepository.findByTransactionId.mockResolvedValue(payment);

      const result = await service.getPaymentStatus(
        'TXN_123',
        PaymentProvider.TRANSBANK,
      );

      expect(result.status).toBe(PaymentStatus.CAPTURED);
      expect(result.id).toBe(payment.id);
    });
  });

  describe('refundPayment', () => {
    it('should refund a captured payment', async () => {
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

      paymentRepository.findByTransactionId.mockResolvedValue(payment);
      transbankService.refundTransaction.mockResolvedValue({
        status: PaymentStatus.REFUNDED,
        refundAmount: 100.5,
      });
      paymentRepository.updatePaymentStatus.mockResolvedValue({
        ...payment,
        status: PaymentStatus.REFUNDED,
      });

      const result = await service.refundPayment(
        'TXN_123',
        PaymentProvider.TRANSBANK,
      );

      expect(result.status).toBe(PaymentStatus.REFUNDED);
      expect(transbankService.refundTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to refund non-captured payment', async () => {
      const payment: Payment = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        transactionId: 'TXN_123',
        provider: PaymentProvider.TRANSBANK,
        amount: 100.5,
        currency: 'CLP',
        status: PaymentStatus.PENDING,
        reference: 'ORD-123456',
        description: 'Test payment',
        authCode: null,
        email: 'test@example.com',
        phone: null,
        returnUrl: 'http://localhost:3000/result',
        webhookUrl: null,
        metadata: null,
        providerResponse: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      paymentRepository.findByTransactionId.mockResolvedValue(payment);

      await expect(
        service.refundPayment('TXN_123', PaymentProvider.TRANSBANK),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listPayments', () => {
    it('should list all payments when no status filter provided', async () => {
      const payments: Payment[] = [
        {
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
        },
      ];

      paymentRepository.find.mockResolvedValue(payments);

      const result = await service.listPayments();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(PaymentStatus.CAPTURED);
    });

    it('should list payments filtered by status', async () => {
      const payments: Payment[] = [];
      paymentRepository.findByStatus.mockResolvedValue(payments);

      await service.listPayments(PaymentStatus.PENDING);

      expect(paymentRepository.findByStatus).toHaveBeenCalledWith(
        PaymentStatus.PENDING,
        10,
      );
    });
  });
});
