import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { getDb } from '@ymshots/db';
import { signAccessToken, signRefreshToken, verifyRefreshToken, authenticate } from '../../lib/auth';
import { ok, error } from '../../lib/response';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  const db = getDb();

  // POST /api/v1/auth/register
  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send(error('VALIDATION', 'Invalid input', parsed.error.flatten().fieldErrors));
    }

    const { email, password, fullName } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send(error('CONFLICT', 'Email already registered'));
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { email, passwordHash, fullName },
    });

    // Create default preferences
    await db.userPreferences.create({ data: { userId: user.id } });

    const accessToken = await signAccessToken({ sub: user.id, email: user.email, plan: user.planTier });
    const refreshToken = await signRefreshToken({ sub: user.id });

    return ok({ user: { id: user.id, email: user.email, fullName: user.fullName, planTier: user.planTier }, accessToken, refreshToken });
  });

  // POST /api/v1/auth/login
  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send(error('VALIDATION', 'Invalid input'));
    }

    const { email, password } = parsed.data;
    const user = await db.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.status(401).send(error('UNAUTHORIZED', 'Invalid credentials'));
    }

    const accessToken = await signAccessToken({ sub: user.id, email: user.email, plan: user.planTier });
    const refreshToken = await signRefreshToken({ sub: user.id });

    return ok({ user: { id: user.id, email: user.email, fullName: user.fullName, planTier: user.planTier }, accessToken, refreshToken });
  });

  // POST /api/v1/auth/refresh
  app.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken?: string };
    if (!refreshToken) {
      return reply.status(400).send(error('VALIDATION', 'Missing refresh token'));
    }

    try {
      const { sub } = await verifyRefreshToken(refreshToken);
      const user = await db.user.findUnique({ where: { id: sub } });
      if (!user) return reply.status(401).send(error('UNAUTHORIZED', 'User not found'));

      const newAccessToken = await signAccessToken({ sub: user.id, email: user.email, plan: user.planTier });
      const newRefreshToken = await signRefreshToken({ sub: user.id });

      return ok({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch {
      return reply.status(401).send(error('UNAUTHORIZED', 'Invalid refresh token'));
    }
  });

  // POST /api/v1/auth/logout
  app.post('/logout', { preHandler: [authenticate] }, async (_request, reply) => {
    // In a full implementation, invalidate the refresh token in Redis
    return reply.status(204).send();
  });

  // GET /api/v1/auth/me → aliased as /users/me in router
  app.get('/me', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, fullName: true, avatarUrl: true,
        planTier: true, planExpiresAt: true, timezone: true, locale: true,
        onboardingCompleted: true, createdAt: true,
      },
    });
    return ok(user);
  });
}
