import { describe, expect, it } from 'vitest';
import { Jobcard, Keyplan, Project, SCHEMA_VERSION, Workpack } from './index';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

describe('Project', () => {
  it('accepts a name and ordered workpack ids', () => {
    const project = {
      schemaVersion: SCHEMA_VERSION,
      id: id(1),
      name: 'Project A',
      workpackIds: [id(2)],
    };
    expect(Project.parse(project)).toEqual(project);
  });

  it('accepts an optional job number and trims it', () => {
    const base = { schemaVersion: SCHEMA_VERSION, id: id(1), name: 'Project A', workpackIds: [] };
    expect(Project.parse({ ...base, jobNumber: ' PO-1234 ' }).jobNumber).toBe('PO-1234');
    expect(Project.parse(base).jobNumber).toBeUndefined();
    expect(Project.safeParse({ ...base, jobNumber: '  ' }).success).toBe(false);
  });

  it('rejects an empty name', () => {
    const result = Project.safeParse({
      schemaVersion: SCHEMA_VERSION,
      id: id(1),
      name: '  ',
      workpackIds: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('Workpack', () => {
  it('accepts a title and ordered jobcard ids', () => {
    const workpack = {
      schemaVersion: SCHEMA_VERSION,
      id: id(2),
      title: 'Module 1',
      jobcardIds: [id(4), id(3)],
    };
    expect(Workpack.parse(workpack).jobcardIds).toEqual([id(4), id(3)]);
  });
});

describe('Workpack module', () => {
  const base = { schemaVersion: SCHEMA_VERSION, id: id(2), title: 'Module 1', jobcardIds: [] };

  it('accepts an optional module and trims it', () => {
    expect(Workpack.parse({ ...base, module: ' M12 ' }).module).toBe('M12');
    expect(Workpack.parse(base).module).toBeUndefined();
    expect(Workpack.safeParse({ ...base, module: ' ' }).success).toBe(false);
  });
});

describe('Workpack keyplan', () => {
  const base = { schemaVersion: SCHEMA_VERSION, id: id(2), title: 'Module 1', jobcardIds: [] };
  const keyplan = { assetId: id(9), mediaType: 'image/png' as const, fileName: ' module-a.png ' };

  it('accepts an optional keyplan reference and trims the file name', () => {
    expect(Workpack.parse({ ...base, keyplan }).keyplan).toEqual({
      ...keyplan,
      fileName: 'module-a.png',
    });
    expect(Workpack.parse(base).keyplan).toBeUndefined();
    expect(Keyplan.safeParse({ assetId: id(9), mediaType: 'image/jpeg' }).success).toBe(true);
  });

  it('rejects an unsupported media type, a bad asset id and an empty file name', () => {
    expect(Keyplan.safeParse({ ...keyplan, mediaType: 'image/gif' }).success).toBe(false);
    expect(Keyplan.safeParse({ ...keyplan, mediaType: 'image/svg+xml' }).success).toBe(false);
    expect(Keyplan.safeParse({ ...keyplan, assetId: 'not-an-id' }).success).toBe(false);
    expect(Keyplan.safeParse({ ...keyplan, fileName: ' ' }).success).toBe(false);
  });
});

describe('Jobcard', () => {
  const jobcard = {
    schemaVersion: SCHEMA_VERSION,
    id: id(3),
    title: 'Clear old lifting points',
    activities: [
      { id: id(5), name: 'Sample activity 1' },
      { id: id(6), name: 'Sample activity 2' },
    ],
  };

  it('keeps activities in order', () => {
    expect(Jobcard.parse(jobcard).activities.map((a) => a.name)).toEqual([
      'Sample activity 1',
      'Sample activity 2',
    ]);
  });

  it('trims titles and activity names', () => {
    const parsed = Jobcard.parse({
      ...jobcard,
      title: '  Padded  ',
      activities: [{ id: id(5), name: ' Name ' }],
    });
    expect(parsed.title).toBe('Padded');
    expect(parsed.activities[0]?.name).toBe('Name');
  });

  it('accepts an optional JC number and trims it', () => {
    expect(Jobcard.parse({ ...jobcard, jcNumber: ' JC-007 ' }).jcNumber).toBe('JC-007');
    expect(Jobcard.parse(jobcard).jcNumber).toBeUndefined();
    expect(Jobcard.safeParse({ ...jobcard, jcNumber: ' ' }).success).toBe(false);
  });

  it('rejects an activity without a name', () => {
    const result = Jobcard.safeParse({ ...jobcard, activities: [{ id: id(5), name: '' }] });
    expect(result.success).toBe(false);
  });

  it('rejects data from an older schema version', () => {
    expect(Jobcard.safeParse({ ...jobcard, schemaVersion: 1 }).success).toBe(false);
  });
});
