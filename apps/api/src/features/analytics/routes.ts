import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../lib/auth';
import { ok } from '../../lib/response';
import { getDb } from '@ymshots/db';

export async function analyticsRoutes(app: FastifyInstance) {
  const db = getDb();

  // GET /api/v1/analytics/revenue
  app.get('/revenue', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const snapshots = await db.revenueSnapshot.findMany({
      where: { userId },
      orderBy: { periodMonth: 'desc' },
      take: 12,
    });
    return ok(snapshots);
  });

  // GET /api/v1/analytics/shoots
  app.get('/shoots', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const shoots = await db.shoot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true, name: true, shootType: true, shootDate: true,
        totalPhotos: true, flaggedCount: true, status: true, createdAt: true,
      },
    });
    return ok(shoots);
  });

  // GET /api/v1/analytics/time
  app.get('/time', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const timeLogs = await db.shootTimeLog.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 100,
      include: { shoot: { select: { name: true } } },
    });
    return ok(timeLogs);
  });
}
