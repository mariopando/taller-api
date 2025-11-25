export enum PaymentProvider {
  TRANSBANK = 'transbank',
  MERCADO_PAGO = 'mercado_pago',
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  ERROR = 'error',
}

export enum TransactionStatus {
  CREATED = 'created',
  INITIALIZED = 'initialized',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PENDING = 'pending',
}
