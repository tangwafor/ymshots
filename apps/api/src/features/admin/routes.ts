import type { FastifyInstance } from 'fastify';
import { ok } from '../../lib/response';
import { getDb } from '@ymshots/db';

/**
 * Vendor/Admin Dashboard API — comprehensive monitoring like PolyHealth.
 * Covers: users, shoots, photos, galleries, invoices, academy, style profiles,
 * exports, tether sessions, analytics, sound events, pitch views, system health.
 */
export async function adminRoutes(app: FastifyInstance) {
  const db = getDb();

  // ═══════════════════════════════════════════════════════
  // DASHBOARD OVERVIEW — single endpoint, all key metrics
  // ═══════════════════════════════════════════════════════

  app.get('/dashboard', async () => {
    const [
      userCount,
      proCount,
      studioCount,
      shootCount,
      photoCount,
      galleryCount,
      invoiceCount,
      paidInvoiceCount,
      exportCount,
      academyLessonCount,
      academyProgressCount,
      styleProfileCount,
      tetherSessionCount,
      pitchViewCount,
      pitchConvertedCount,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { planTier: 'PRO' } }),
      db.user.count({ where: { planTier: 'STUDIO' } }),
      db.shoot.count(),
      db.photo.count(),
      db.gallery.count(),
      db.invoice.count(),
      db.invoice.count({ where: { status: 'PAID' } }),
      db.exportJob.count(),
      db.academyLesson.count(),
      db.userAcademyProgress.count({ where: { status: 'COMPLETED' } }),
      db.styleProfile.count(),
      db.tetherSession.count(),
      db.pitchView.count(),
      db.pitchView.count({ where: { converted: true } }),
    ]);

    // Revenue from paid invoices
    const revenueResult = await db.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { totalCents: true },
    });
    const totalRevenueCents = revenueResult._sum.totalCents ?? 0n;

    return ok({
      users: {
        total: userCount,
        free: userCount - proCount - studioCount,
        pro: proCount,
        studio: studioCount,
      },
      content: {
        shoots: shootCount,
        photos: photoCount,
        galleries: galleryCount,
        styleProfiles: styleProfileCount,
        exports: exportCount,
        tetherSessions: tetherSessionCount,
      },
      revenue: {
        totalCents: Number(totalRevenueCents),
        invoicesTotal: invoiceCount,
        invoicesPaid: paidInvoiceCount,
        conversionRate: invoiceCount > 0 ? Math.round((paidInvoiceCount / invoiceCount) * 100) : 0,
      },
      academy: {
        lessons: academyLessonCount,
        completions: academyProgressCount,
      },
      pitch: {
        views: pitchViewCount,
        conversions: pitchConvertedCount,
        conversionRate: pitchViewCount > 0 ? Math.round((pitchConvertedCount / pitchViewCount) * 100) : 0,
      },
    });
  });

  // ═══════════════════════════════════════════════════════
  // USERS MANAGEMENT
  // ═══════════════════════════════════════════════════════

  app.get('/users', async (request) => {
    const { page = 1, limit = 50, plan, search } = request.query as {
      page?: number; limit?: number; plan?: string; search?: string;
    };

    const where: any = {};
    if (plan) where.planTier = plan;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true, email: true, fullName: true, avatarUrl: true,
          planTier: true, planExpiresAt: true, onboardingCompleted: true,
          createdAt: true, updatedAt: true,
          _count: {
            select: {
              shoots: true, galleries: true, invoices: true,
              styleProfiles: true, academyProgress: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return ok({ users, total, page: Number(page), limit: Number(limit) });
  });

  app.get('/users/:id', async (request) => {
    const { id } = request.params as { id: string };
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, fullName: true, avatarUrl: true,
        planTier: true, planExpiresAt: true, stripeCustomerId: true,
        timezone: true, locale: true, onboardingCompleted: true,
        createdAt: true, updatedAt: true,
        preferences: true,
        academyStats: true,
        _count: {
          select: {
            shoots: true, photos: true, galleries: true, invoices: true,
            styleProfiles: true, presets: true, exportJobs: true,
            academyProgress: true, challengeSubmissions: true,
          },
        },
      },
    });
    if (!user) return { error: { code: 'NOT_FOUND', message: 'User not found' } };
    return ok(user);
  });

  app.get('/users/:id/activity', async (request) => {
    const { id } = request.params as { id: string };
    const [recentShoots, recentExports, recentEvents] = await Promise.all([
      db.shoot.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, name: true, shootType: true, status: true, totalPhotos: true, createdAt: true },
      }),
      db.exportJob.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, format: true, status: true, progressPct: true, createdAt: true },
      }),
      db.analyticsEvent.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, eventType: true, eventDataJson: true, createdAt: true },
      }),
    ]);
    return ok({ recentShoots, recentExports, recentEvents });
  });

  // ═══════════════════════════════════════════════════════
  // SHOOTS & PHOTOS
  // ═══════════════════════════════════════════════════════

  app.get('/shoots', async (request) => {
    const { page = 1, limit = 50, status, type } = request.query as {
      page?: number; limit?: number; status?: string; type?: string;
    };

    const where: any = {};
    if (status) where.status = status;
    if (type) where.shootType = type;

    const [shoots, total] = await Promise.all([
      db.shoot.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: { select: { fullName: true, email: true } },
          client: { select: { fullName: true } },
          _count: { select: { photos: true, galleries: true } },
        },
      }),
      db.shoot.count({ where }),
    ]);
    return ok({ shoots, total, page: Number(page), limit: Number(limit) });
  });

  app.get('/shoots/stats', async () => {
    const byStatus = await db.shoot.groupBy({
      by: ['status'],
      _count: true,
    });
    const byType = await db.shoot.groupBy({
      by: ['shootType'],
      _count: true,
    });
    const photoStats = await db.photo.aggregate({
      _count: true,
      _sum: { fileSizeBytes: true },
      _avg: { sharpnessScore: true, expressionScore: true },
    });
    return ok({ byStatus, byType, photoStats });
  });

  // ═══════════════════════════════════════════════════════
  // GALLERIES
  // ═══════════════════════════════════════════════════════

  app.get('/galleries', async (request) => {
    const { page = 1, limit = 50, status } = request.query as {
      page?: number; limit?: number; status?: string;
    };

    const where: any = {};
    if (status) where.status = status;

    const [galleries, total] = await Promise.all([
      db.gallery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: { select: { fullName: true } },
          shoot: { select: { name: true } },
          _count: { select: { photos: true } },
        },
      }),
      db.gallery.count({ where }),
    ]);
    return ok({ galleries, total, page: Number(page), limit: Number(limit) });
  });

  app.get('/galleries/stats', async () => {
    const byStatus = await db.gallery.groupBy({
      by: ['status'],
      _count: true,
    });
    const totalViews = await db.gallery.aggregate({ _sum: { viewCount: true } });
    const selectionsCount = await db.galleryPhoto.count({ where: { clientSelected: true } });
    return ok({ byStatus, totalViews: totalViews._sum.viewCount ?? 0, clientSelections: selectionsCount });
  });

  // ═══════════════════════════════════════════════════════
  // INVOICES & REVENUE
  // ═══════════════════════════════════════════════════════

  app.get('/invoices', async (request) => {
    const { page = 1, limit = 50, status } = request.query as {
      page?: number; limit?: number; status?: string;
    };

    const where: any = {};
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: { select: { fullName: true } },
          client: { select: { fullName: true, email: true } },
          _count: { select: { lineItems: true } },
        },
      }),
      db.invoice.count({ where }),
    ]);
    return ok({ invoices, total, page: Number(page), limit: Number(limit) });
  });

  app.get('/revenue', async () => {
    const byStatus = await db.invoice.groupBy({
      by: ['status'],
      _count: true,
      _sum: { totalCents: true },
    });
    const byCurrency = await db.invoice.groupBy({
      by: ['currency'],
      _count: true,
      _sum: { totalCents: true },
    });
    const monthlySnapshots = await db.revenueSnapshot.findMany({
      orderBy: { periodMonth: 'desc' },
      take: 12,
    });
    return ok({ byStatus, byCurrency, monthlySnapshots });
  });

  // ═══════════════════════════════════════════════════════
  // SIGNATUREAI & STYLE PROFILES
  // ═══════════════════════════════════════════════════════

  app.get('/style-profiles', async (request) => {
    const { page = 1, limit = 50 } = request.query as { page?: number; limit?: number };

    const [profiles, total] = await Promise.all([
      db.styleProfile.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: { select: { fullName: true, email: true } },
          _count: { select: { trainingPairs: true } },
        },
      }),
      db.styleProfile.count(),
    ]);
    return ok({ profiles, total, page: Number(page), limit: Number(limit) });
  });

  app.get('/style-profiles/stats', async () => {
    const totalProfiles = await db.styleProfile.count();
    const activeProfiles = await db.styleProfile.count({ where: { isActive: true } });
    const totalPairs = await db.styleTrainingPair.count();
    const avgPairsResult = await db.styleTrainingPair.groupBy({
      by: ['profileId'],
      _count: true,
    });
    const avgPairsPerProfile = avgPairsResult.length > 0
      ? Math.round(avgPairsResult.reduce((sum, g) => sum + g._count, 0) / avgPairsResult.length)
      : 0;
    return ok({ totalProfiles, activeProfiles, totalPairs, avgPairsPerProfile });
  });

  // ═══════════════════════════════════════════════════════
  // ACADEMY MONITORING
  // ═══════════════════════════════════════════════════════

  app.get('/academy/overview', async () => {
    const lessonCount = await db.academyLesson.count();
    const completions = await db.userAcademyProgress.count({ where: { status: 'COMPLETED' } });
    const inProgress = await db.userAcademyProgress.count({ where: { status: 'IN_PROGRESS' } });
    const challengeSubmissions = await db.challengeSubmission.count();
    const challengesPassed = await db.challengeSubmission.count({ where: { passed: true } });

    const byLevel = await db.userAcademyStats.groupBy({
      by: ['currentLevel'],
      _count: true,
    });

    const topLessons = await db.userAcademyProgress.groupBy({
      by: ['lessonId'],
      where: { status: 'COMPLETED' },
      _count: true,
      orderBy: { _count: { lessonId: 'desc' } },
      take: 10,
    });

    // Resolve lesson names
    const lessonIds = topLessons.map(t => t.lessonId);
    const lessons = await db.academyLesson.findMany({
      where: { id: { in: lessonIds } },
      select: { id: true, title: true, slug: true },
    });
    const lessonMap = Object.fromEntries(lessons.map(l => [l.id, l]));

    return ok({
      lessonCount,
      completions,
      inProgress,
      challengeSubmissions,
      challengesPassed,
      challengePassRate: challengeSubmissions > 0
        ? Math.round((challengesPassed / challengeSubmissions) * 100)
        : 0,
      byLevel,
      topLessons: topLessons.map(t => ({
        ...lessonMap[t.lessonId],
        completions: t._count,
      })),
    });
  });

  app.get('/academy/lessons', async () => {
    const lessons = await db.academyLesson.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { progress: true, challenges: true },
        },
      },
    });
    return ok(lessons);
  });

  // ═══════════════════════════════════════════════════════
  // EXPORTS & JOBS
  // ═══════════════════════════════════════════════════════

  app.get('/exports', async (request) => {
    const { page = 1, limit = 50, status } = request.query as {
      page?: number; limit?: number; status?: string;
    };

    const where: any = {};
    if (status) where.status = status;

    const [jobs, total] = await Promise.all([
      db.exportJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: { user: { select: { fullName: true } } },
      }),
      db.exportJob.count({ where }),
    ]);
    return ok({ jobs, total, page: Number(page), limit: Number(limit) });
  });

  app.get('/exports/stats', async () => {
    const byStatus = await db.exportJob.groupBy({ by: ['status'], _count: true });
    const byFormat = await db.exportJob.groupBy({ by: ['format'], _count: true });
    return ok({ byStatus, byFormat });
  });

  // ═══════════════════════════════════════════════════════
  // TETHER SESSIONS
  // ═══════════════════════════════════════════════════════

  app.get('/tether-sessions', async (request) => {
    const { page = 1, limit = 50 } = request.query as { page?: number; limit?: number };

    const [sessions, total] = await Promise.all([
      db.tetherSession.findMany({
        orderBy: { startedAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: { select: { fullName: true } },
          shoot: { select: { name: true } },
        },
      }),
      db.tetherSession.count(),
    ]);
    return ok({ sessions, total, page: Number(page), limit: Number(limit) });
  });

  // ═══════════════════════════════════════════════════════
  // PITCH DECK ANALYTICS
  // ═══════════════════════════════════════════════════════

  app.get('/pitch', async () => {
    const bySource = await db.pitchView.groupBy({
      by: ['source'],
      _count: true,
    });
    const bySlide = await db.pitchView.groupBy({
      by: ['slideReached'],
      _count: true,
      orderBy: { slideReached: 'asc' },
    });
    const conversions = await db.pitchView.groupBy({
      by: ['planChosen'],
      where: { converted: true },
      _count: true,
    });
    const totalViews = await db.pitchView.count();
    const totalConversions = await db.pitchView.count({ where: { converted: true } });
    return ok({
      totalViews,
      totalConversions,
      conversionRate: totalViews > 0 ? Math.round((totalConversions / totalViews) * 100) : 0,
      bySource,
      bySlide,
      conversions,
    });
  });

  // ═══════════════════════════════════════════════════════
  // SOUNDPULSE ANALYTICS
  // ═══════════════════════════════════════════════════════

  app.get('/sound-events', async () => {
    const byEvent = await db.soundEventLog.groupBy({
      by: ['eventKey'],
      _count: true,
      orderBy: { _count: { eventKey: 'desc' } },
    });
    const totalPlays = await db.soundEventLog.count();
    return ok({ totalPlays, byEvent });
  });

  // ═══════════════════════════════════════════════════════
  // CLIENTS
  // ═══════════════════════════════════════════════════════

  app.get('/clients', async (request) => {
    const { page = 1, limit = 50, search } = request.query as {
      page?: number; limit?: number; search?: string;
    };

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      db.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: { select: { fullName: true } },
          _count: { select: { shoots: true, invoices: true } },
        },
      }),
      db.client.count({ where }),
    ]);
    return ok({ clients, total, page: Number(page), limit: Number(limit) });
  });

  // ═══════════════════════════════════════════════════════
  // SYSTEM HEALTH
  // ═══════════════════════════════════════════════════════

  app.get('/health', async () => {
    const dbHealthy = await db.$queryRaw`SELECT 1`.then(() => true).catch(() => false);

    // Recent activity indicators
    const recentUsers = await db.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    const recentShoots = await db.shoot.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    const recentExports = await db.exportJob.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    const failedExports = await db.exportJob.count({ where: { status: 'FAILED' } });

    return ok({
      database: dbHealthy ? 'healthy' : 'unhealthy',
      last24h: {
        newUsers: recentUsers,
        newShoots: recentShoots,
        exports: recentExports,
        failedExports,
      },
      timestamp: new Date().toISOString(),
    });
  });
}
