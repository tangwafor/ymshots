import type { FastifyInstance } from 'fastify';
import { authRoutes } from './features/auth/routes';
import { galleryRoutes } from './features/gallery/routes';
import { galleryPublicRoutes } from './features/gallery/public';
import { invoiceRoutes } from './features/invoicing/routes';
import { paymentRoutes } from './features/invoicing/payment-routes';
import { webhookRoutes } from './features/invoicing/webhooks';
import { analyticsRoutes } from './features/analytics/routes';
import { academyRoutes } from './features/academy/routes';
import { adminRoutes } from './features/admin/routes';
import { shotTalkRoutes } from './features/shottalk/routes';
import { styleForgeRoutes } from './features/styleforge/routes';

export async function registerRoutes(app: FastifyInstance) {
  // Public gallery route — /g/:slug (no auth, client-facing)
  await app.register(galleryPublicRoutes, { prefix: '/g' });

  // All API routes under /api/v1/
  await app.register(async (v1) => {
    await v1.register(authRoutes, { prefix: '/auth' });
    await v1.register(galleryRoutes, { prefix: '/galleries' });
    await v1.register(invoiceRoutes, { prefix: '/invoices' });
    await v1.register(paymentRoutes, { prefix: '/payments' });
    await v1.register(analyticsRoutes, { prefix: '/analytics' });
    await v1.register(academyRoutes, { prefix: '/academy' });
    await v1.register(adminRoutes, { prefix: '/admin' });
    await v1.register(shotTalkRoutes, { prefix: '/shottalk' });
    await v1.register(styleForgeRoutes, { prefix: '/styleforge' });
    await v1.register(webhookRoutes, { prefix: '/webhooks' });
  }, { prefix: '/api/v1' });
}
