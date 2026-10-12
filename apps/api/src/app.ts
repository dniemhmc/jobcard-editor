import { listContentTemplates } from '@jobcard/content-templates';
import Fastify, { type FastifyServerOptions } from 'fastify';

export function buildApp(opts: FastifyServerOptions = {}) {
  const app = Fastify(opts);

  app.get('/api/health', () => ({ status: 'ok' }));

  app.get('/api/content-templates', () => listContentTemplates());

  return app;
}
