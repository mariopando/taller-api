import { Test, type TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"
import { MercadoPagoService } from "./mercado-pago.service"
import { PaymentStatus } from "src/common/enums/payment-provider.enum"
import { jest } from "@jest/globals"

describe("MercadoPagoService", () => {
  let service: MercadoPagoService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              mercadoPago: {
                apiKey: "test_key",
                apiSecret: "test_secret",
                apiUrl: "https://api.mercadopago.com",
              },
            }),
          },
        },
      ],
    }).compile()

    service = module.get<MercadoPagoService>(MercadoPagoService)
    configService = module.get<ConfigService>(ConfigService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("createPreference", () => {
    it("should create preference successfully", async () => {
      const result = await service.createPreference(
        50.0,
        "ARS",
        "Test payment",
        "ORD-654321",
        "test@example.com",
        "http://localhost:3000/result",
      )

      expect(result).toHaveProperty("preferenceId")
      expect(result).toHaveProperty("redirectUrl")
      expect(result.redirectUrl).toContain("mercadopago.com")
      expect(result.redirectUrl).toContain(result.preferenceId)
    })
  })

  describe("getPaymentInfo", () => {
    it("should get payment info successfully", async () => {
      const result = await service.getPaymentInfo("MP_PAYMENT_123")

      expect(result.status).toBe(PaymentStatus.CAPTURED)
      expect(result.statusDetail).toBe("accredited")
      expect(result).toHaveProperty("authCode")
      expect(result).toHaveProperty("amount")
    })
  })

  describe("refundPayment", () => {
    it("should refund payment successfully", async () => {
      const result = await service.refundPayment("MP_PAYMENT_123", 50.0)

      expect(result.status).toBe(PaymentStatus.REFUNDED)
      expect(result.refundAmount).toBe(50.0)
      expect(result).toHaveProperty("refundId")
      expect(result.refundId).toMatch(/^MP_/)
    })

    it("should refund without amount parameter", async () => {
      const result = await service.refundPayment("MP_PAYMENT_123")

      expect(result.status).toBe(PaymentStatus.REFUNDED)
      expect(result.refundAmount).toBe(0)
    })
  })

  describe("validateNotification", () => {
    it("should validate notification successfully", async () => {
      const notificationData = {
        id: "123456",
        status: "approved",
      }

      const result = await service.validateNotification(notificationData)

      expect(result).toBe(true)
    })
  })
})
