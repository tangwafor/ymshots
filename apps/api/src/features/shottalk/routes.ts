import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../lib/auth';
import { ok, paginated, error } from '../../lib/response';
import { getDb } from '@ymshots/db';

export async function shotTalkRoutes(app: FastifyInstance) {
  const db = getDb();

  // ─── THREADS ───

  // GET /api/v1/shottalk/threads
  app.get('/threads', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const { page = 1, limit = 50, status } = request.query as { page?: number; limit?: number; status?: string };

    const where: any = { userId };
    if (status) where.status = status;

    const [threads, total] = await Promise.all([
      db.shotTalkThread.findMany({
        where,
        orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { body: true, senderName: true, createdAt: true } },
          _count: { select: { messages: true } },
        },
      }),
      db.shotTalkThread.count({ where }),
    ]);

    return paginated(threads, Number(page), Number(limit), total);
  });

  // POST /api/v1/shottalk/threads
  app.post('/threads', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const body = request.body as { title: string; clientId?: string; shootId?: string; galleryId?: string };

    const thread = await db.shotTalkThread.create({
      data: {
        userId,
        title: body.title,
        clientId: body.clientId,
        shootId: body.shootId,
        galleryId: body.galleryId,
      },
    });

    return ok(thread);
  });

  // GET /api/v1/shottalk/threads/:id
  app.get('/threads/:id', { preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const thread = await db.shotTalkThread.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            attachments: true,
            annotations: true,
          },
        },
      },
    });
    if (!thread) return error('NOT_FOUND', 'Thread not found');
    return ok(thread);
  });

  // ─── MESSAGES ───

  // POST /api/v1/shottalk/threads/:id/messages
  app.post('/threads/:id/messages', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const { id: threadId } = request.params as { id: string };
    const body = request.body as { body: string; photoId?: string; senderName?: string };

    const user = await db.user.findUnique({ where: { id: userId }, select: { fullName: true } });

    const message = await db.shotTalkMessage.create({
      data: {
        threadId,
        senderId: userId,
        senderType: 'PHOTOGRAPHER',
        senderName: body.senderName || user?.fullName || 'Photographer',
        body: body.body,
        photoId: body.photoId,
      },
    });

    // Update thread lastMessageAt
    await db.shotTalkThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() },
    });

    return ok(message);
  });

  // POST /api/v1/shottalk/messages/:id/read
  app.post('/messages/:id/read', { preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    await db.shotTalkMessage.update({
      where: { id },
      data: { isRead: true },
    });
    return ok({ read: true });
  });

  // ─── PHOTO ANNOTATIONS ───

  // POST /api/v1/shottalk/messages/:id/annotations
  app.post('/messages/:id/annotations', { preHandler: [authenticate] }, async (request) => {
    const { id: messageId } = request.params as { id: string };
    const body = request.body as { photoId: string; pinX: number; pinY: number; note: string };

    const annotation = await db.photoAnnotation.create({
      data: {
        messageId,
        photoId: body.photoId,
        pinX: body.pinX,
        pinY: body.pinY,
        note: body.note,
      },
    });

    return ok(annotation);
  });

  // GET /api/v1/shottalk/photos/:photoId/annotations
  app.get('/photos/:photoId/annotations', { preHandler: [authenticate] }, async (request) => {
    const { photoId } = request.params as { photoId: string };
    const annotations = await db.photoAnnotation.findMany({
      where: { photoId },
      orderBy: { createdAt: 'asc' },
      include: {
        message: { select: { senderName: true, senderType: true, createdAt: true } },
      },
    });
    return ok(annotations);
  });

  // PATCH /api/v1/shottalk/annotations/:id/resolve
  app.patch('/annotations/:id/resolve', { preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const annotation = await db.photoAnnotation.update({
      where: { id },
      data: { resolved: true },
    });
    return ok(annotation);
  });

  // ─── UNREAD COUNT ───

  app.get('/unread', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const count = await db.shotTalkMessage.count({
      where: {
        thread: { userId },
        isRead: false,
        senderType: { not: 'PHOTOGRAPHER' },
      },
    });
    return ok({ unread: count });
  });
}
