CREATE TYPE "PaymentMethod" AS ENUM ('MOBILE_MONEY_MTN', 'MOBILE_MONEY_ORANGE', 'CARD', 'BANK_TRANSFER', 'CASH', 'STRIPE', 'FLUTTERWAVE', 'OTHER');
CREATE TYPE "PaymentProvider" AS ENUM ('NOTCHPAY', 'CINETPAY', 'FLUTTERWAVE', 'STRIPE', 'MANUAL');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELLED');

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS "paymentMethod" "PaymentMethod";
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS "paymentProvider" "PaymentProvider";
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS "providerTransactionId" TEXT;
ALTER TABLE invoices DROP COLUMN IF EXISTS "stripePaymentIntentId";

CREATE TABLE payments (
  id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "invoiceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amountCents" BIGINT NOT NULL,
  currency CHAR(3) NOT NULL,
  method "PaymentMethod" NOT NULL,
  provider "PaymentProvider" NOT NULL,
  "providerTxId" TEXT,
  "providerResponse" JSONB,
  status "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "phoneNumber" TEXT,
  "cashReceivedBy" TEXT,
  "cashReceiptPhotoUrl" TEXT,
  "cashNote" TEXT,
  "failureReason" TEXT,
  "paidAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_invoiceId_fkey FOREIGN KEY ("invoiceId") REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE payment_provider_configs (
  id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  provider "PaymentProvider" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "configJson" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_provider_configs_pkey PRIMARY KEY (id),
  CONSTRAINT payment_provider_configs_userId_provider_key UNIQUE ("userId", provider)
);
