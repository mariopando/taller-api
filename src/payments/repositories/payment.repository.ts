/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, Logger } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import {
  PaymentStatus,
  type PaymentProvider,
} from 'src/common/enums/payment-provider.enum';

@Injectable()
export class PaymentRepository extends Repository<Payment> {
  private logger = new Logger(PaymentRepository.name);

  constructor(private dataSource: DataSource) {
    super(Payment, dataSource.createEntityManager());
  }

  async findByTransactionId(
    transactionId: string,
    provider: PaymentProvider,
  ): Promise<Payment | null> {
    return this.findOne({
      where: { transactionId, provider },
    });
  }

  async findByReference(reference: string): Promise<Payment | null> {
    return this.findOne({
      where: { reference },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: PaymentStatus, limit = 10): Promise<Payment[]> {
    return this.find({
      where: { status },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingPayments(): Promise<Payment[]> {
    return this.find({
      where: { status: PaymentStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
    authCode?: string,
    providerResponse?: string,
  ): Promise<any> {
    await this.update(id, {
      status,
      authCode,
      providerResponse,
      updatedAt: new Date(),
    });
    // const updatedPayment = await this.findOne({ where: { id } });
    this.logger.debug(`Payment ${id} status updated to ${status}`);
    // return updatedPayment;
  }

  async findByProviderAndStatus(
    provider: PaymentProvider,
    status: PaymentStatus,
    limit = 10,
  ): Promise<Payment[]> {
    return this.find({
      where: { provider, status },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentStats(): Promise<{
    totalCount: number;
    capturedCount: number;
    pendingCount: number;
    totalAmount: number;
  }> {
    const query = this.createQueryBuilder('payment');

    const [totalCount, capturedCount, pendingCount] = await Promise.all([
      query.getCount(),
      this.count({ where: { status: PaymentStatus.CAPTURED } }),
      this.count({ where: { status: PaymentStatus.PENDING } }),
    ]);

    const sumResult = await this.createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'sum')
      .where('payment.status = :status', { status: PaymentStatus.CAPTURED })
      .getRawOne();

    return {
      totalCount,
      capturedCount,
      pendingCount,
      totalAmount: Number(sumResult?.sum || 0),
    };
  }
}
