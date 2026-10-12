import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { contentTemplates, getGenericTemplate, listContentTemplates } from './index';

const templatesDir = fileURLToPath(new URL('../templates', import.meta.url));

describe('content templates', () => {
  it('registers every JSON file in templates/ under a matching id', () => {
    const fileIds = readdirSync(templatesDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
      .sort();
    expect(contentTemplates.map((t) => t.id).sort()).toEqual(fileIds);
  });

  it('has unique ids', () => {
    const ids = contentTemplates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has an approved, empty generic template', () => {
    const generic = getGenericTemplate();
    expect(generic.status).toBe('approved');
    expect(generic.steps).toEqual([]);
  });

  it('hides draft templates by default', () => {
    expect(listContentTemplates().every((t) => t.status === 'approved')).toBe(true);
  });
});
