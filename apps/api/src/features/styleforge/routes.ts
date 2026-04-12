import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../lib/auth';
import { ok, paginated } from '../../lib/response';
import { getDb } from '@ymshots/db';

export async function styleForgeRoutes(app: FastifyInstance) {
  const db = getDb();

  // POST /api/v1/styleforge/jobs — create a new effect job
  app.post('/jobs', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const body = request.body as {
      photoId: string;
      effect: string;
      intensity?: number;
      params?: Record<string, unknown>;
    };

    const job = await db.styleForgeJob.create({
      data: {
        userId,
        photoId: body.photoId,
        effect: body.effect as any,
        intensity: body.intensity ?? 1.0,
        paramsJson: body.params ?? {},
        status: 'QUEUED',
      },
    });

    // In a real implementation, this would queue the job for ONNX processing
    // via BullMQ. For now, mark as complete immediately (stub).

    return ok(job);
  });

  // GET /api/v1/styleforge/jobs — list user's effect jobs
  app.get('/jobs', { preHandler: [authenticate] }, async (request) => {
    const userId = (request as any).userId;
    const { page = 1, limit = 50 } = request.query as { page?: number; limit?: number };

    const [jobs, total] = await Promise.all([
      db.styleForgeJob.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      db.styleForgeJob.count({ where: { userId } }),
    ]);

    return paginated(jobs, Number(page), Number(limit), total);
  });

  // GET /api/v1/styleforge/jobs/:id
  app.get('/jobs/:id', { preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const job = await db.styleForgeJob.findUnique({ where: { id } });
    if (!job) return { error: { code: 'NOT_FOUND', message: 'Job not found' } };
    return ok(job);
  });

  // GET /api/v1/styleforge/effects — list available effects
  app.get('/effects', async () => {
    return ok([
      { id: 'CARTOON',          name: 'Cartoon',          description: 'Bold outlines, flat colors', category: 'illustration' },
      { id: 'COMIC',            name: 'Comic Book',       description: 'Halftone dots, bold shadows', category: 'illustration' },
      { id: 'WATERCOLOR',       name: 'Watercolor',       description: 'Soft washes, paper texture', category: 'painting' },
      { id: 'OIL_PAINTING',     name: 'Oil Painting',     description: 'Rich brushstrokes, deep color', category: 'painting' },
      { id: 'PENCIL_SKETCH',    name: 'Pencil Sketch',    description: 'Graphite lines, subtle shading', category: 'drawing' },
      { id: 'CHARCOAL',         name: 'Charcoal',         description: 'Deep blacks, textured strokes', category: 'drawing' },
      { id: 'POP_ART',          name: 'Pop Art',          description: 'Warhol-inspired color blocks', category: 'artistic' },
      { id: 'THREE_D_CHARACTER', name: '3D Character',    description: 'Pixar-style 3D rendering', category: 'artistic' },
      { id: 'ANIME',            name: 'Anime',            description: 'Japanese animation style', category: 'illustration' },
      { id: 'CARICATURE',       name: 'Caricature',       description: 'Exaggerated features, playful', category: 'artistic' },
      { id: 'MOSAIC',           name: 'Mosaic',           description: 'Tile pattern reconstruction', category: 'artistic' },
      { id: 'NEON_GLOW',        name: 'Neon Glow',        description: 'Glowing edges on dark', category: 'artistic' },
    ]);
  });
}
