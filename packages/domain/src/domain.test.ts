import { describe, expect, it } from 'vitest';
import { Annotation, ContentTemplate, Jobcard, createJobcardFromTemplate } from './index';

const template = ContentTemplate.parse({
  id: 'test-template',
  version: 2,
  status: 'approved',
  name: 'Test',
  description: 'A test template',
  defaults: { title: 'Do the thing', discipline: 'Mechanical' },
  steps: [{ text: 'First step' }, { text: 'Second step', details: 'Careful' }],
});

let counter = 0;
const newId = () => `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`;

describe('createJobcardFromTemplate', () => {
  it('produces a valid draft jobcard with the template steps', () => {
    const jobcard = createJobcardFromTemplate({
      workpackId: newId(),
      jobNumber: 'JC-001',
      template,
      user: 'tester',
      now: () => new Date('2026-01-01T00:00:00Z'),
      newId,
    });

    expect(Jobcard.parse(jobcard)).toEqual(jobcard);
    expect(jobcard.status).toBe('draft');
    expect(jobcard.title).toBe('Do the thing');
    expect(jobcard.contentTemplate).toEqual({ id: 'test-template', version: 2 });
    expect(jobcard.steps.map((s) => s.text)).toEqual(['First step', 'Second step']);
    expect(new Set(jobcard.steps.map((s) => s.id)).size).toBe(2);
  });
});

describe('Annotation', () => {
  it('rejects coordinates outside the normalised 0..1 range', () => {
    const result = Annotation.safeParse({
      kind: 'highlight',
      id: newId(),
      color: '#ff0000',
      geometry: { shape: 'rect', x: 0.5, y: 0.5, width: 1.5, height: 0.1 },
    });
    expect(result.success).toBe(false);
  });

  it('accepts a highlight with a label and leader line', () => {
    const result = Annotation.safeParse({
      kind: 'highlight',
      id: newId(),
      color: '#ff0000',
      geometry: { shape: 'ellipse', cx: 0.4, cy: 0.4, rx: 0.1, ry: 0.05 },
      label: { text: 'Padeye PE-01', position: { x: 0.7, y: 0.2 }, anchor: { x: 0.4, y: 0.4 } },
    });
    expect(result.success).toBe(true);
  });
});
