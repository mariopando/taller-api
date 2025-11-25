import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"
import { PaymentProvider, PaymentStatus } from "src/common/enums/payment-provider.enum"

@Entity("payments")
@Index(["transactionId", "provider"], { unique: true })
@Index(["reference"])
@Index(["status"])
@Index(["createdAt"])
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", enum: PaymentProvider })
  provider: PaymentProvider

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number

  @Column({ type: "varchar", length: 3 })
  currency: string

  @Column({ type: "varchar", enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus

  @Column({ type: "varchar" })
  transactionId: string

  @Column({ type: "varchar" })
  reference: string

  @Column({ type: "text" })
  description: string

  @Column({ type: "varchar", nullable: true })
  authCode?: string

  @Column({ type: "varchar", nullable: true })
  email?: string

  @Column({ type: "varchar", nullable: true })
  phone?: string

  @Column({ type: "varchar", nullable: true })
  returnUrl?: string

  @Column({ type: "varchar", nullable: true })
  webhookUrl?: string

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>

  @Column({ type: "text", nullable: true })
  providerResponse?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
