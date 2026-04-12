import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../lib/auth';
import { ok, paginated } from '../../lib/response';
import { getDb } from '@ymshots/db';

export async function invoiceRoutes(app: FastifyInstance) {
  const db = getDb();

  // GET /api/v1/invoices
  app.get('/', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const { page = 1, limit = 50 } = request.query as { page?: number; limit?: number };

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { client: { select: { fullName: true, email: true } } },
      }),
      db.invoice.count({ where: { userId } }),
    ]);

    return paginated(invoices, page, limit, total);
  });

  // POST /api/v1/invoices
  app.post('/', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const body = request.body as {
      clientId: string;
      shootId?: string;
      lineItems: Array<{ description: string; quantity: number; unitPriceCents: number }>;
      taxRate: number;
      currency: string;
      dueDate?: string;
      notes?: string;
    };

    const subtotalCents = body.lineItems.reduce(
      (sum, item) => sum + BigInt(Math.round(item.quantity * item.unitPriceCents)),
      0n
    );
    const taxCents = BigInt(Math.round(Number(subtotalCents) * body.taxRate));
    const totalCents = subtotalCents + taxCents;

    // Generate invoice number: YMS-YYYYMM-XXXX
    const count = await db.invoice.count({ where: { userId } });
    const now = new Date();
    const invoiceNumber = `YMS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await db.invoice.create({
      data: {
        userId,
        clientId: body.clientId,
        shootId: body.shootId,
        invoiceNumber,
        subtotalCents,
        taxRate: body.taxRate,
        taxCents,
        totalCents,
        currency: body.currency || 'USD',
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        notes: body.notes,
        lineItems: {
          create: body.lineItems.map((item, i) => ({
            description: item.description,
            quantity: item.quantity,
            unitPriceCents: BigInt(item.unitPriceCents),
            totalCents: BigInt(Math.round(item.quantity * item.unitPriceCents)),
            sortOrder: i,
          })),
        },
      },
      include: { lineItems: true },
    });

    return ok(invoice);
  });

  // POST /api/v1/webhooks/stripe — registered at top level in router
}
