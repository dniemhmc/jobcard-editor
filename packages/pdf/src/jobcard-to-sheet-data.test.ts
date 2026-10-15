import type { Jobcard, Project, Workpack } from '@jobcard/domain';
import { describe, expect, it } from 'vitest';
import { jobcardToSheetData } from './jobcard-to-sheet-data';

const audit = {
  createdAt: '2026-03-01T08:00:00Z',
  createdBy: 'tester',
  updatedAt: '2026-03-02T08:00:00Z',
  updatedBy: 'tester',
};
const project: Project = {
  schemaVersion: 1,
  id: '00000000-0000-4000-8000-000000000001',
  code: 'P001',
  name: 'Example decommissioning',
  installation: 'Platform A',
  audit,
};
const workpack: Workpack = {
  schemaVersion: 1,
  id: '00000000-0000-4000-8000-000000000002',
  projectId: project.id,
  code: 'WP-01',
  title: 'Utilities module',
  jobcardIds: [],
  audit,
};
const imageId = '00000000-0000-4000-8000-000000000009';
const jobcard: Jobcard = {
  schemaVersion: 1,
  id: '00000000-0000-4000-8000-000000000003',
  workpackId: workpack.id,
  jobNumber: 'JC-001',
  title: 'Remove grating',
  revision: 'A',
  status: 'draft',
  location: { module: 'M03', deck: 'Cellar deck' },
  discipline: 'mech',
  steps: [
    { id: '00000000-0000-4000-8000-000000000004', text: 'First', imageIds: [imageId] },
    { id: '00000000-0000-4000-8000-000000000005', text: 'Second', details: 'd', imageIds: [] },
  ],
  images: [
    {
      id: imageId,
      assetId: '00000000-0000-4000-8000-00000000000a',
      caption: 'Grating',
      source: { kind: 'upload' },
      annotations: [],
    },
  ],
  audit,
};

describe('jobcardToSheetData', () => {
  const data = jobcardToSheetData(jobcard, { project, workpack, imageUrl: (id) => `/a/${id}` });

  it('fills the title block from the jobcard', () => {
    expect(data.titleBlock).toMatchObject({
      project: 'P001 Example decommissioning',
      jcNo: 'JC-001',
      revision: 'A',
      module: 'M03',
      date: '2026-03-02',
    });
    expect(data.location).toBe('M03 / Cellar deck');
  });

  it('turns the flat steps into one main activity', () => {
    expect(data.activities).toHaveLength(1);
    expect(data.activities[0]?.steps).toEqual([
      { text: 'First', details: undefined },
      { text: 'Second', details: 'd' },
    ]);
  });

  it('recognises a known discipline code', () => {
    expect(data.disciplines).toEqual([{ code: 'MECH' }]);
    expect(data.activities[0]?.disciplines).toEqual([{ code: 'MECH' }]);
  });

  it('uses step images as activity pictures', () => {
    expect(data.activities[0]?.pictures).toEqual([
      { caption: 'Grating', src: '/a/00000000-0000-4000-8000-00000000000a' },
    ]);
  });
});
