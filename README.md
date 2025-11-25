# Payment Gateway API

Production-ready NestJS payment gateway for integrating **Transbank** and **Mercado Pago** payment methods. Designed for seamless integration with Next.js frontend applications and Railway deployment.

## Features

✅ Dual Payment Provider Support (Transbank & Mercado Pago)
✅ Complete Payment Lifecycle Management
✅ Unit Test Coverage
✅ TypeORM Database Integration (PostgreSQL)
✅ Swagger/OpenAPI Documentation
✅ Docker & Docker Compose Ready
✅ Environment-based Configuration
✅ CORS & Security Headers
✅ Webhook/Callback Support
✅ Refund Processing

## Tech Stack

- **Framework**: NestJS 10+
- **Database**: PostgreSQL with TypeORM
- **Testing**: Jest with comprehensive unit tests
- **API Docs**: Swagger/OpenAPI 3.0
- **Container**: Docker & Docker Compose
- **Language**: TypeScript

## Prerequisites

- Node.js v20.19.0 or higher
- npm v11.2.0 or higher (or yarn v1.22.22+)
- PostgreSQL 14+ (or use Docker)
- Transbank and Mercado Pago API credentials

## Installation

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd payment-gateway-api
npm install
\`\`\`

### 2. Environment Configuration

Copy and configure the environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

Update `.env` with your credentials:

\`\`\`env
# Database
DATABASE_PASSWORD=your_secure_password

# Transbank
TRANSBANK_API_KEY=your_key
TRANSBANK_API_SECRET=your_secret
TRANSBANK_COMMERCE_ID=your_commerce_id

# Mercado Pago
MERCADO_PAGO_API_KEY=your_key
MERCADO_PAGO_API_SECRET=your_secret
\`\`\`

## Running the Application

### Development

\`\`\`bash
npm run start:dev
\`\`\`

API runs at: `http://localhost:8080/api`
Swagger docs: `http://localhost:8080/api/docs`

### Production Build

\`\`\`bash
npm run build
npm run start:prod
\`\`\`

### Testing

\`\`\`bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:cov         # Coverage report
\`\`\`

## Docker

### Build and Run

\`\`\`bash
docker build -t payment-gateway-api .
docker run -d -p 8080:8080 --env-file .env payment-gateway-api
\`\`\`

### Using Docker Compose

\`\`\`bash
docker-compose up -d
\`\`\`

Includes PostgreSQL database automatically.

## API Endpoints

### Payment Initialization

\`\`\`http
POST /api/payments/initialize
Content-Type: application/json

{
  "provider": "transbank",
  "amount": 9999,
  "currency": "CLP",
  "reference": "ORD-12345",
  "description": "Product Purchase",
  "email": "customer@example.com",
  "returnUrl": "http://localhost:3000/payment-result"
}
\`\`\`

**Response:**
\`\`\`json
{
  "transactionId": "TXN_1699564800000_abc123",
  "provider": "transbank",
  "redirectUrl": "https://payment-provider.com/checkout",
  "token": "token_123",
  "message": "Payment initialized successfully"
}
\`\`\`

### Payment Confirmation

\`\`\`http
POST /api/payments/confirm
Content-Type: application/json

{
  "transactionId": "TXN_1699564800000_abc123",
  "token": "token_123",
  "provider": "transbank"
}
\`\`\`

### Payment Status

\`\`\`http
GET /api/payments/status/{transactionId}?provider=transbank
\`\`\`

### Payment Refund

\`\`\`http
POST /api/payments/refund/{transactionId}
Content-Type: application/json

{
  "provider": "transbank",
  "amount": 9999
}
\`\`\`

### Webhook Callback

\`\`\`http
POST /api/payments/webhook/callback
Content-Type: application/json

{
  "transactionId": "TXN_1699564800000_abc123",
  "provider": "transbank",
  "status": "CAPTURED",
  "authCode": "AUTH123",
  "metadata": {}
}
\`\`\`

### List Payments

\`\`\`http
GET /api/payments/list?status=CAPTURED&limit=10
\`\`\`

## Integration with Next.js Frontend

### Example Frontend Code

\`\`\`typescript
// lib/payment.ts
export const initializePayment = async (paymentData: CreatePaymentDto) => {
  const response = await fetch('/api/payments/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });

  const result = await response.json();
  return result.redirectUrl;
};
\`\`\`

\`\`\`typescript
// components/payment-button.tsx
'use client';

import { initializePayment } from '@/lib/payment';

export function PaymentButton() {
  const handlePayment = async () => {
    const redirectUrl = await initializePayment({
      provider: 'transbank',
      amount: 9999,
      currency: 'CLP',
      reference: 'ORD-12345',
      description: 'Product Purchase',
      email: 'customer@example.com',
      returnUrl: window.location.origin + '/payment-result',
    });

    window.location.href = redirectUrl;
  };

  return <button onClick={handlePayment}>Pay Now</button>;
}
\`\`\`

## Database

### Running Migrations

\`\`\`bash
npm run typeorm migration:generate -- -n CreatePaymentTable
npm run typeorm migration:run
\`\`\`

## Project Structure

\`\`\`
src/
├── config/              # Configuration management
│   └── environments.ts
├── common/              # Shared utilities
│   ├── dto/            # Data Transfer Objects
│   └── enums/          # Enumerations
├── payments/           # Payment module
│   ├── controllers/    # API endpoints
│   ├── services/       # Business logic
│   ├── providers/      # Payment providers (Transbank, Mercado Pago)
│   ├── repositories/   # Database access
│   ├── entities/       # Database models
│   └── payments.module.ts
├── app.module.ts       # Root module
└── main.ts             # Application entry point
\`\`\`

## Testing

Tests follow NestJS best practices with Jest:

\`\`\`bash
npm run test                    # Run all tests
npm run test:watch            # Watch mode
npm run test:cov              # Coverage report
npm run test:debug            # Debug mode
\`\`\`

Test files are co-located with source code (*.spec.ts).

## Deployment to Railway

### 1. Push to GitHub

\`\`\`bash
git add .
git commit -m "feat: payment gateway API"
git push origin main
\`\`\`

### 2. Connect to Railway

- Create project on [Railway.app](https://railway.app)
- Connect your GitHub repository
- Add PostgreSQL database plugin
- Configure environment variables from `.env.example`

### 3. Deploy

Railway automatically deploys on git push. Monitor from the dashboard.

## Environment Variables

See `.env.example` for complete list. Key variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 8080) |
| `API_PREFIX` | API base path | No (default: api) |
| `DATABASE_*` | PostgreSQL connection | Yes |
| `TRANSBANK_*` | Transbank credentials | Yes |
| `MERCADO_PAGO_*` | Mercado Pago credentials | Yes |
| `SWAGGER_ENABLED` | Enable API docs | No (default: true) |

## Scripts

\`\`\`bash
npm run build              # Build project
npm run format             # Format code with Prettier
npm start                  # Start production server
npm run start:dev          # Start development server
npm run lint               # Lint with ESLint
npm run test               # Run tests
npm run test:cov           # Test with coverage
\`\`\`

## Troubleshooting

### Database Connection Error

Ensure PostgreSQL is running and credentials are correct:

\`\`\`bash
# Test connection
psql -h localhost -U postgres -d payment_gateway
\`\`\`

### Provider API Error

- Verify API keys in `.env`
- Check provider documentation for IP allowlists
- Ensure correct provider endpoints

### Tests Failing

\`\`\`bash
npm run test -- --verbose
npm run test:debug
\`\`\`

## License

MIT - See LICENSE file for details

## Support

For issues and questions, open a GitHub issue or contact support.
