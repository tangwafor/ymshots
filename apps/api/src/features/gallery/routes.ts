import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../lib/auth';
import { ok, paginated } from '../../lib/response';
import { getDb } from '@ymshots/db';

export async function galleryRoutes(app: FastifyInstance) {
  const db = getDb();

  // GET /api/v1/galleries
  app.get('/', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const { page = 1, limit = 50 } = request.query as { page?: number; limit?: number };

    const [galleries, total] = await Promise.all([
      db.gallery.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { shoot: { select: { name: true } }, _count: { select: { photos: true } } },
      }),
      db.gallery.count({ where: { userId } }),
    ]);

    return paginated(galleries, page, limit, total);
  });

  // POST /api/v1/galleries
  app.post('/', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const body = request.body as { shootId: string; title: string; subtitle?: string };

    const gallery = await db.gallery.create({
      data: {
        userId,
        shootId: body.shootId,
        title: body.title,
        subtitle: body.subtitle,
        slug: `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      },
    });

    return ok(gallery);
  });

  // Public gallery route: GET /g/:slug (registered separately in router)
  // SSE for real-time client selections: GET /api/v1/galleries/:id/events
  // Client heart tap: POST /g/:slug/select
}
