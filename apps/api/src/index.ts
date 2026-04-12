import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { registerRoutes } from './router';

const PORT = Number(process.env.API_PORT) || 3001;
const HOST = process.env.API_HOST || '0.0.0.0';

async function main() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  });

  // Security & CORS
  await app.register(helmet);
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Health check
  app.get('/health', async () => ({ status: 'ok', version: '1.0.0', name: 'YmShotS API' }));

  // All API routes
  await registerRoutes(app);

  // Start
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`YmShotS API running on http://${HOST}:${PORT}`);
}

main().catch((err) => {
  console.error('Failed to start YmShotS API:', err);
  process.exit(1);
});
