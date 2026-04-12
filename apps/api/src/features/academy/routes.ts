import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../lib/auth';
import { ok } from '../../lib/response';
import { getDb } from '@ymshots/db';

export async function academyRoutes(app: FastifyInstance) {
  const db = getDb();

  // GET /api/v1/academy/lessons
  app.get('/lessons', async () => {
    const lessons = await db.academyLesson.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true, slug: true, title: true, description: true,
        skillLevel: true, engine: true, durationSeconds: true,
        xpReward: true, sortOrder: true,
      },
    });
    return ok(lessons);
  });

  // GET /api/v1/academy/lessons/:slug
  app.get('/lessons/:slug', async (request) => {
    const { slug } = request.params as { slug: string };
    const lesson = await db.academyLesson.findUnique({ where: { slug } });
    if (!lesson) return { error: { code: 'NOT_FOUND', message: 'Lesson not found' } };
    return ok(lesson);
  });

  // GET /api/v1/academy/progress
  app.get('/progress', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const progress = await db.userAcademyProgress.findMany({
      where: { userId },
      include: { lesson: { select: { slug: true, title: true, skillLevel: true } } },
    });
    return ok(progress);
  });

  // POST /api/v1/academy/progress/:lessonId/complete
  app.post('/progress/:lessonId/complete', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const { lessonId } = request.params as { lessonId: string };

    const lesson = await db.academyLesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return { error: { code: 'NOT_FOUND', message: 'Lesson not found' } };

    const progress = await db.userAcademyProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        status: 'COMPLETED',
        completedAt: new Date(),
        xpEarned: lesson.xpReward,
        attemptCount: { increment: 1 },
      },
      create: {
        userId,
        lessonId,
        status: 'COMPLETED',
        completedAt: new Date(),
        xpEarned: lesson.xpReward,
        attemptCount: 1,
      },
    });

    // Update stats
    await db.userAcademyStats.upsert({
      where: { userId },
      update: {
        totalXp: { increment: lesson.xpReward },
        lessonsCompleted: { increment: 1 },
        lastActiveDate: new Date(),
      },
      create: {
        userId,
        totalXp: lesson.xpReward,
        lessonsCompleted: 1,
        lastActiveDate: new Date(),
      },
    });

    return ok(progress);
  });

  // GET /api/v1/academy/stats
  app.get('/stats', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const stats = await db.userAcademyStats.findUnique({ where: { userId } });
    return ok(stats ?? {
      totalXp: 0, currentStreak: 0, longestStreak: 0,
      lessonsCompleted: 0, challengesPassed: 0, currentLevel: 'BEGINNER',
    });
  });
}
