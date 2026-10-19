import { describe, expect, it } from 'vitest';
import {
  addActivity,
  addJobcard,
  addWorkpack,
  createProject,
  deleteActivity,
  deleteJobcard,
  deleteProject,
  deleteWorkpack,
  emptyWorkspace,
  findJobcard,
  findProject,
  findWorkpack,
  jobcardsOf,
  moveActivity,
  moveInList,
  moveJobcard,
  moveWorkpack,
  renameActivity,
  renameJobcard,
  renameProject,
  setJobcardNumber,
  setProjectJobNumber,
  setWorkpackKeyplan,
  setWorkpackModule,
  renameWorkpack,
  Workspace,
  workpacksOf,
} from './index';

/** Deterministic id generator: 00000000-0000-4000-8000-000000000001, …0002, … */
function ids() {
  let n = 0;
  return () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;
}

/** A project with two workpacks; the first has two jobcards, the first of which has three activities. */
function sample() {
  const newId = ids();
  const p = createProject(emptyWorkspace(), 'Project A', newId);
  const w1 = addWorkpack(p.workspace, p.id, 'Module 1', newId);
  const w2 = addWorkpack(w1.workspace, p.id, 'Module 2', newId);
  const j1 = addJobcard(w2.workspace, w1.id, 'Jobcard 1', newId);
  const j2 = addJobcard(j1.workspace, w1.id, 'Jobcard 2', newId);
  const a1 = addActivity(j2.workspace, j1.id, 'Activity 1', newId);
  const a2 = addActivity(a1.workspace, j1.id, 'Activity 2', newId);
  const a3 = addActivity(a2.workspace, j1.id, 'Activity 3', newId);
  return {
    ws: a3.workspace,
    newId,
    projectId: p.id,
    w1: w1.id,
    w2: w2.id,
    j1: j1.id,
    j2: j2.id,
    activities: [a1.id, a2.id, a3.id],
  };
}

const activityNames = (ws: Workspace, jobcardId: string) =>
  findJobcard(ws, jobcardId)?.activities.map((a) => a.name);

describe('moveInList', () => {
  it('moves an item up and down, clamped to the list', () => {
    expect(moveInList(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
    expect(moveInList(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
    expect(moveInList(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
    expect(moveInList(['a', 'b', 'c'], 2, 5)).toEqual(['a', 'b', 'c']);
  });

  it('leaves the list unchanged for a missing item', () => {
    expect(moveInList(['a', 'b'], -1, 1)).toEqual(['a', 'b']);
  });
});

describe('workspace', () => {
  it('builds a valid workspace with children in order', () => {
    const { ws, projectId } = sample();
    expect(Workspace.safeParse(ws).success).toBe(true);
    const project = findProject(ws, projectId)!;
    const workpacks = workpacksOf(ws, project);
    expect(workpacks.map((w) => w.title)).toEqual(['Module 1', 'Module 2']);
    expect(jobcardsOf(ws, workpacks[0]!).map((j) => j.title)).toEqual(['Jobcard 1', 'Jobcard 2']);
  });

  it('trims names and rejects empty ones', () => {
    const { ws, projectId, w1, j1, activities } = sample();
    expect(findProject(renameProject(ws, projectId, '  B  '), projectId)?.name).toBe('B');
    expect(() => renameProject(ws, projectId, ' ')).toThrow();
    expect(() => renameWorkpack(ws, w1, '')).toThrow();
    expect(() => renameJobcard(ws, j1, '')).toThrow();
    expect(() => renameActivity(ws, j1, activities[0]!, '')).toThrow();
  });

  it('sets the job number of a project, trimmed, and clears it when empty', () => {
    const { ws, projectId } = sample();
    const set = setProjectJobNumber(ws, projectId, '  PO-1234 ');
    expect(findProject(set, projectId)?.jobNumber).toBe('PO-1234');
    const cleared = findProject(setProjectJobNumber(set, projectId, '  '), projectId);
    expect(cleared).toBeDefined();
    expect(cleared).not.toHaveProperty('jobNumber');
    expect(Workspace.safeParse(setProjectJobNumber(set, projectId, '')).success).toBe(true);
  });

  it('sets the module of a workpack, trimmed, and clears it when empty', () => {
    const { ws, w1, w2 } = sample();
    const set = setWorkpackModule(ws, w1, '  M12 ');
    expect(findWorkpack(set, w1)?.module).toBe('M12');
    expect(findWorkpack(set, w2)).not.toHaveProperty('module');
    expect(findWorkpack(setWorkpackModule(set, w1, ' '), w1)).not.toHaveProperty('module');
  });

  it('sets the keyplan of a workpack and removes it again', () => {
    const { ws, w1, w2 } = sample();
    const keyplan = { assetId: ids()(), mediaType: 'image/png' as const, fileName: 'a.png' };
    const set = setWorkpackKeyplan(ws, w1, keyplan);
    expect(findWorkpack(set, w1)?.keyplan).toEqual(keyplan);
    expect(findWorkpack(set, w2)).not.toHaveProperty('keyplan');
    expect(Workspace.safeParse(set).success).toBe(true);
    const replaced = setWorkpackKeyplan(set, w1, { ...keyplan, mediaType: 'image/jpeg' });
    expect(findWorkpack(replaced, w1)?.keyplan?.mediaType).toBe('image/jpeg');
    expect(findWorkpack(setWorkpackKeyplan(set, w1, undefined), w1)).not.toHaveProperty('keyplan');
  });

  it('sets the JC number of a jobcard, trimmed, and clears it when empty', () => {
    const { ws, j1, j2 } = sample();
    const set = setJobcardNumber(ws, j1, '  JC-007 ');
    expect(findJobcard(set, j1)?.jcNumber).toBe('JC-007');
    expect(findJobcard(set, j2)).not.toHaveProperty('jcNumber');
    expect(findJobcard(setJobcardNumber(set, j1, ''), j1)).not.toHaveProperty('jcNumber');
    expect(Workspace.safeParse(setJobcardNumber(set, j1, '')).success).toBe(true);
  });

  it('renames workpacks, jobcards and activities', () => {
    const { ws, w1, j1, activities } = sample();
    expect(findWorkpack(renameWorkpack(ws, w1, 'M1'), w1)?.title).toBe('M1');
    expect(findJobcard(renameJobcard(ws, j1, 'J1'), j1)?.title).toBe('J1');
    expect(activityNames(renameActivity(ws, j1, activities[1]!, 'Two'), j1)).toEqual([
      'Activity 1',
      'Two',
      'Activity 3',
    ]);
  });

  it('does not change the input workspace', () => {
    const { ws, j1 } = sample();
    const before: unknown = JSON.parse(JSON.stringify(ws));
    deleteJobcard(renameJobcard(ws, j1, 'Other'), j1);
    expect(ws).toEqual(before);
  });

  it('inserts a new activity after a given one', () => {
    const { ws, newId, j1, activities } = sample();
    const next = addActivity(ws, j1, 'Inserted', newId, activities[0]);
    expect(activityNames(next.workspace, j1)).toEqual([
      'Activity 1',
      'Inserted',
      'Activity 2',
      'Activity 3',
    ]);
  });

  it('reorders workpacks, jobcards and activities', () => {
    const { ws, projectId, w2, j2, j1, w1, activities } = sample();
    expect(findProject(moveWorkpack(ws, w2, -1), projectId)?.workpackIds[0]).toBe(w2);
    expect(findWorkpack(moveJobcard(ws, j2, -1), w1)?.jobcardIds).toEqual([j2, j1]);
    expect(activityNames(moveActivity(ws, j1, activities[0]!, 1), j1)).toEqual([
      'Activity 2',
      'Activity 1',
      'Activity 3',
    ]);
  });

  it('deletes an activity', () => {
    const { ws, j1, activities } = sample();
    expect(activityNames(deleteActivity(ws, j1, activities[1]!), j1)).toEqual([
      'Activity 1',
      'Activity 3',
    ]);
  });

  it('deletes a jobcard and removes it from its workpack', () => {
    const { ws, w1, j1, j2 } = sample();
    const next = deleteJobcard(ws, j1);
    expect(findJobcard(next, j1)).toBeUndefined();
    expect(findWorkpack(next, w1)?.jobcardIds).toEqual([j2]);
  });

  it('deletes a workpack with its jobcards', () => {
    const { ws, projectId, w1, w2 } = sample();
    const next = deleteWorkpack(ws, w1);
    expect(next.workpacks.map((w) => w.id)).toEqual([w2]);
    expect(next.jobcards).toEqual([]);
    expect(findProject(next, projectId)?.workpackIds).toEqual([w2]);
  });

  it('deletes a project with everything in it', () => {
    const { ws, projectId, newId } = sample();
    const other = createProject(ws, 'Project B', newId);
    expect(deleteProject(other.workspace, projectId)).toEqual({
      projects: [findProject(other.workspace, other.id)],
      workpacks: [],
      jobcards: [],
    });
  });
});
