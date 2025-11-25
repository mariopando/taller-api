import { Test, type TestingModule } from "@nestjs/testing"
import { PaymentsController } from "./payments.controller"
import { PaymentsService } from "../services/payments.service"
import { PaymentProvider, PaymentStatus } from "src/common/enums/payment-provider.enum"
import type { CreatePaymentDto } from "src/common/dto/create-payment.dto"
import { jest } from "@jest/globals"

describe("PaymentsController", () => {
  let controller: PaymentsController
  let service: jest.Mocked<PaymentsService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            createPayment: jest.fn(),
            confirmPayment: jest.fn(),
            getPaymentStatus: jest.fn(),
            refundPayment: jest.fn(),
            handleCallback: jest.fn(),
            listPayments: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<PaymentsController>(PaymentsController)
    service = module.get(PaymentsService) as jest.Mocked<PaymentsService>
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("POST /payments/initialize", () => {
    it("should initialize a payment", async () => {
      const createPaymentDto: CreatePaymentDto = {
        amount: 100.5,
        currency: "CLP",
        provider: PaymentProvider.TRANSBANK,
        reference: "ORD-123456",
        description: "Test payment",
        email: "test@example.com",
        returnUrl: "http://localhost:3000/result",
      }

      const expectedResponse = {
        transactionId: "TXN_123",
        provider: PaymentProvider.TRANSBANK,
        redirectUrl: "https://transbank.com/pay",
        token: "TOKEN_123",
        message: "Payment initialized successfully",
      }

      service.createPayment.mockResolvedValue(expectedResponse)

      const result = await controller.initializePayment(createPaymentDto)

      expect(result).toEqual(expectedResponse)
      expect(service.createPayment).toHaveBeenCalledWith(createPaymentDto)
    })
  })

  describe("POST /payments/confirm", () => {
    it("should confirm a payment", async () => {
      const transactionId = "TXN_123"
      const token = "TOKEN_123"
      const provider = PaymentProvider.TRANSBANK

      const expectedResponse = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        provider,
        amount: 100.5,
        currency: "CLP",
        status: PaymentStatus.CAPTURED,
        transactionId,
        authCode: "AUTH123",
        message: "Payment captured",
        timestamp: new Date(),
      }

      service.confirmPayment.mockResolvedValue(expectedResponse)

      const result = await controller.confirmPayment(transactionId, token, provider)

      expect(result).toEqual(expectedResponse)
      expect(service.confirmPayment).toHaveBeenCalledWith(transactionId, token, provider)
    })
  })

  describe("GET /payments/status/:transactionId", () => {
    it("should get payment status", async () => {
      const transactionId = "TXN_123"
      const provider = PaymentProvider.TRANSBANK

      const expectedResponse = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        provider,
        amount: 100.5,
        currency: "CLP",
        status: PaymentStatus.CAPTURED,
        transactionId,
        authCode: "AUTH123",
        message: "Payment captured",
        timestamp: new Date(),
      }

      service.getPaymentStatus.mockResolvedValue(expectedResponse)

      const result = await controller.getPaymentStatus(transactionId, provider)

      expect(result).toEqual(expectedResponse)
      expect(service.getPaymentStatus).toHaveBeenCalledWith(transactionId, provider)
    })
  })

  describe("POST /payments/refund/:transactionId", () => {
    it("should refund a payment", async () => {
      const transactionId = "TXN_123"
      const provider = PaymentProvider.TRANSBANK

      const expectedResponse = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        provider,
        amount: 100.5,
        currency: "CLP",
        status: PaymentStatus.REFUNDED,
        transactionId,
        message: "Payment refunded",
        timestamp: new Date(),
      }

      service.refundPayment.mockResolvedValue(expectedResponse)

      const result = await controller.refundPayment(transactionId, provider)

      expect(result).toEqual(expectedResponse)
      expect(service.refundPayment).toHaveBeenCalledWith(transactionId, provider, undefined)
    })
  })

  describe("POST /payments/webhook/callback", () => {
    it("should handle payment callback", async () => {
      const callbackData = {
        provider: PaymentProvider.TRANSBANK,
        transactionId: "TXN_123",
        status: PaymentStatus.CAPTURED,
        authCode: "AUTH123",
        metadata: {},
      }

      service.handleCallback.mockResolvedValue({
        id: "123e4567-e89b-12d3-a456-426614174000",
      } as any)

      const result = await controller.handleCallback(callbackData)

      expect(result.success).toBe(true)
      expect(result.message).toBe("Webhook processed")
      expect(service.handleCallback).toHaveBeenCalledWith(callbackData)
    })
  })

  describe("GET /payments/list", () => {
    it("should list payments", async () => {
      const expectedResponse = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          provider: PaymentProvider.TRANSBANK,
          amount: 100.5,
          currency: "CLP",
          status: PaymentStatus.CAPTURED,
          transactionId: "TXN_123",
          message: "Payment captured",
          timestamp: new Date(),
        },
      ]

      service.listPayments.mockResolvedValue(expectedResponse)

      const result = await controller.listPayments()

      expect(result).toEqual(expectedResponse)
      expect(service.listPayments).toHaveBeenCalled()
    })
  })
})
