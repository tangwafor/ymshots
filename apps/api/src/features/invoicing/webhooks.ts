import type { FastifyInstance } from 'fastify';
import { getDb } from '@ymshots/db';

/**
 * Payment provider webhooks.
 * These endpoints receive POST callbacks from payment providers
 * when a payment status changes (success, failure, refund).
 *
 * NO AUTH — webhooks are called by external services.
 * Each provider has its own signature verification.
 */
export async function webhookRoutes(app: FastifyInstance) {
  const db = getDb();

  // ─── NotchPay webhook ───
  // POST /api/v1/webhooks/notchpay
  app.post('/notchpay', async (request, reply) => {
    const body = request.body as {
      event: string;
      data: {
        reference: string;
        status: string;
        amount: number;
        currency: string;
        customer?: { phone?: string };
      };
    };

    // TODO: Verify webhook signature using NotchPay hash header
    // const signature = request.headers['x-notchpay-signature'];

    if (body.event === 'payment.complete' || body.data?.status === 'complete') {
      const payment = await db.payment.findFirst({
        where: { providerTxId: body.data.reference },
      });

      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCEEDED',
            paidAt: new Date(),
            providerResponse: body as any,
          },
        });

        await db.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: 'PAID', paidAt: new Date() },
        });
      }
    }

    return reply.status(200).send({ received: true });
  });

  // ─── Flutterwave webhook ───
  // POST /api/v1/webhooks/flutterwave
  app.post('/flutterwave', async (request, reply) => {
    const body = request.body as {
      event: string;
      data: {
        id: number;
        tx_ref: string;
        status: string;
        amount: number;
        currency: string;
      };
    };

    // TODO: Verify webhook using Flutterwave secret hash
    // const hash = request.headers['verif-hash'];
    // if (hash !== process.env.FLUTTERWAVE_WEBHOOK_HASH) return reply.status(401).send();

    if (body.event === 'charge.completed' && body.data?.status === 'successful') {
      // tx_ref is our invoiceId
      const payment = await db.payment.findFirst({
        where: { providerTxId: body.data.tx_ref },
      });

      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCEEDED',
            paidAt: new Date(),
            providerResponse: body as any,
          },
        });

        await db.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: 'PAID', paidAt: new Date() },
        });
      }
    }

    return reply.status(200).send({ received: true });
  });

  // ─── Stripe webhook ───
  // POST /api/v1/webhooks/stripe
  app.post('/stripe', { config: { rawBody: true } }, async (request, reply) => {
    const body = request.body as {
      type: string;
      data: {
        object: {
          id: string;
          payment_status: string;
          metadata?: { invoiceId?: string };
        };
      };
    };

    // TODO: Verify Stripe webhook signature
    // const sig = request.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);

    if (body.type === 'checkout.session.completed') {
      const session = body.data.object;
      if (session.payment_status === 'paid') {
        const payment = await db.payment.findFirst({
          where: { providerTxId: session.id },
        });

        if (payment) {
          await db.payment.update({
            where: { id: payment.id },
            data: {
              status: 'SUCCEEDED',
              paidAt: new Date(),
              providerResponse: body as any,
            },
          });

          await db.invoice.update({
            where: { id: payment.invoiceId },
            data: { status: 'PAID', paidAt: new Date() },
          });
        }
      }
    }

    return reply.status(200).send({ received: true });
  });
}
