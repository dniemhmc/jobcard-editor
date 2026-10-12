import { describe, expect, it } from 'vitest';
import { buildApp } from './app';

describe('api', () => {
  it('reports health', async () => {
    const res = await buildApp().inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });

  it('lists approved content templates including generic', async () => {
    const res = await buildApp().inject({ method: 'GET', url: '/api/content-templates' });
    const ids = res.json<{ id: string }[]>().map((t) => t.id);
    expect(ids).toContain('generic');
  });
});
