import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../lib/auth';
import { ok, error } from '../../lib/response';
import { getDb } from '@ymshots/db';
import { createProvider, resolveProvider, type ProviderName } from '../../lib/payments/provider';

export async function paymentRoutes(app: FastifyInstance) {
  const db = getDb();

  // POST /api/v1/payments/initiate — start a payment for an invoice
  app.post('/initiate', { preHandler: [authenticate] }, async (request, reply) => {
    const userId = (request as any).userId;
    const body = request.body as {
      invoiceId: string;
      method: string;       // 'MOBILE_MONEY_MTN', 'CARD', 'CASH', etc.
      phoneNumber?: string; // Required for mobile money
      email?: string;       // Required for card
    };

    const invoice = await db.invoice.findUnique({ where: { id: body.invoiceId } });
    if (!invoice) return reply.status(404).send(error('NOT_FOUND', 'Invoice not found'));
    if (invoice.status === 'PAID') return reply.status(400).send(error('ALREADY_PAID', 'Invoice is already paid'));

    // Get photographer's configured providers
    const configs = await db.paymentProviderConfig.findMany({ where: { userId, isActive: true } });
    const configuredProviders = configs.map(c => c.provider as ProviderName);

    // Always include MANUAL (cash/bank)
    if (!configuredProviders.includes('MANUAL')) configuredProviders.push('MANUAL');

    // Resolve which provider to use
    const providerName = resolveProvider(body.method, configuredProviders);
    const providerConfig = configs.find(c => c.provider === providerName);
    const configData = (providerConfig?.configJson as Record<string, string>) ?? {};

    const provider = createProvider(providerName, configData);

    const result = await provider.initiate({
      invoiceId: body.invoiceId,
      amountCents: Number(invoice.totalCents),
      currency: invoice.currency,
      method: body.method,
      phoneNumber: body.phoneNumber,
      email: body.email,
      description: `Invoice ${invoice.invoiceNumber}`,
    });

    // Record the payment attempt
    const payment = await db.payment.create({
      data: {
        invoiceId: body.invoiceId,
        userId,
        amountCents: invoice.totalCents,
        currency: invoice.currency,
        method: body.method as any,
        provider: providerName as any,
        providerTxId: result.providerTxId,
        providerResponse: result.providerResponse as any,
        status: result.status as any,
        phoneNumber: body.phoneNumber,
      },
    });

    // Update invoice with payment method
    await db.invoice.update({
      where: { id: body.invoiceId },
      data: {
        paymentMethod: body.method as any,
        paymentProvider: providerName as any,
        providerTransactionId: result.providerTxId,
        status: 'SENT',
      },
    });

    return ok({
      paymentId: payment.id,
      status: result.status,
      checkoutUrl: result.checkoutUrl,
      provider: providerName,
      method: body.method,
    });
  });

  // POST /api/v1/payments/:id/confirm-cash — photographer confirms cash receipt
  app.post('/:id/confirm-cash', { preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      receivedBy?: string;     // Who received the cash
      receiptPhotoUrl?: string; // Optional photo of the cash/receipt
      note?: string;
    };

    const payment = await db.payment.update({
      where: { id },
      data: {
        status: 'SUCCEEDED',
        cashReceivedBy: body.receivedBy,
        cashReceiptPhotoUrl: body.receiptPhotoUrl,
        cashNote: body.note,
        paidAt: new Date(),
      },
    });

    // Mark invoice as paid
    await db.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'PAID', paidAt: new Date() },
    });

    return ok(payment);
  });

  // POST /api/v1/payments/:id/verify — check payment status with provider
  app.post('/:id/verify', { preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as { id: string };

    const payment = await db.payment.findUnique({ where: { id } });
    if (!payment) return { error: { code: 'NOT_FOUND', message: 'Payment not found' } };
    if (payment.status === 'SUCCEEDED') return ok({ status: 'SUCCEEDED', alreadyPaid: true });

    // Get provider config
    const config = await db.paymentProviderConfig.findFirst({
      where: { userId: payment.userId, provider: payment.provider },
    });
    const configData = (config?.configJson as Record<string, string>) ?? {};
    const provider = createProvider(payment.provider as ProviderName, configData);

    const result = await provider.verify(payment.providerTxId || '');

    // Update payment status
    await db.payment.update({
      where: { id },
      data: {
        status: result.status as any,
        providerResponse: result.providerResponse as any,
        paidAt: result.status === 'SUCCEEDED' ? new Date() : undefined,
      },
    });

    // If succeeded, mark invoice paid
    if (result.status === 'SUCCEEDED') {
      await db.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'PAID', paidAt: new Date() },
      });
    }

    return ok({ status: result.status, provider: payment.provider });
  });

  // GET /api/v1/payments/methods — available payment methods for this user
  app.get('/methods', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const configs = await db.paymentProviderConfig.findMany({ where: { userId, isActive: true } });

    const methods = [
      // Always available
      { id: 'CASH', name: 'Cash', nameEn: 'Cash', nameFr: 'Espèces', icon: '\u{1F4B5}', provider: 'MANUAL', available: true },
      { id: 'BANK_TRANSFER', name: 'Bank Transfer', nameEn: 'Bank Transfer', nameFr: 'Virement bancaire', icon: '\u{1F3E6}', provider: 'MANUAL', available: true },
    ];

    // NotchPay configured → MTN MoMo + Orange Money
    if (configs.some(c => c.provider === 'NOTCHPAY')) {
      methods.unshift(
        { id: 'MOBILE_MONEY_MTN', name: 'MTN MoMo', nameEn: 'MTN Mobile Money', nameFr: 'MTN Mobile Money', icon: '\u{1F4F1}', provider: 'NOTCHPAY', available: true },
        { id: 'MOBILE_MONEY_ORANGE', name: 'Orange Money', nameEn: 'Orange Money', nameFr: 'Orange Money', icon: '\u{1F4F1}', provider: 'NOTCHPAY', available: true },
      );
    }

    // Flutterwave configured → cards + mobile money
    if (configs.some(c => c.provider === 'FLUTTERWAVE')) {
      methods.push(
        { id: 'CARD', name: 'Card', nameEn: 'Debit/Credit Card', nameFr: 'Carte bancaire', icon: '\u{1F4B3}', provider: 'FLUTTERWAVE', available: true },
      );
    }

    // Stripe configured → international cards
    if (configs.some(c => c.provider === 'STRIPE')) {
      methods.push(
        { id: 'STRIPE', name: 'Stripe', nameEn: 'Pay with Stripe', nameFr: 'Payer avec Stripe', icon: '\u{1F4B3}', provider: 'STRIPE', available: true },
      );
    }

    return ok(methods);
  });

  // POST /api/v1/payments/configure — set up a payment provider
  app.post('/configure', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const body = request.body as { provider: string; config: Record<string, string> };

    const result = await db.paymentProviderConfig.upsert({
      where: { userId_provider: { userId, provider: body.provider as any } },
      update: { configJson: body.config, isActive: true },
      create: { userId, provider: body.provider as any, configJson: body.config },
    });

    return ok(result);
  });
}
