import {
  addActivity,
  addJobcard,
  addWorkpack,
  createProject,
  deleteActivity,
  deleteJobcard,
  emptyWorkspace,
} from '@jobcard/domain';
import { describe, expect, it } from 'vitest';
import { breadcrumb, projectSummary, resolveSelection, sameSelection } from './selection';

function sample() {
  let n = 0;
  const newId = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;
  const p = createProject(emptyWorkspace(), 'Project A', newId);
  const other = createProject(p.workspace, 'Project B', newId);
  const w = addWorkpack(other.workspace, p.id, 'Module 1', newId);
  const j = addJobcard(w.workspace, w.id, 'Clear lifting points', newId);
  const a1 = addActivity(j.workspace, j.id, 'First', newId);
  const a2 = addActivity(a1.workspace, j.id, 'Second', newId);
  return { ws: a2.workspace, p: p.id, other: other.id, w: w.id, j: j.id, a2: a2.id };
}

describe('resolveSelection', () => {
  it('resolves an activity with its parents', () => {
    const { ws, p, j, a2 } = sample();
    const r = resolveSelection(ws, p, { kind: 'activity', jobcardId: j, id: a2 })!;
    expect(breadcrumb(r)).toEqual(['Project A', 'Module 1', 'Clear lifting points', 'Activity 2']);
  });

  it('falls back to the jobcard when the activity was deleted', () => {
    const { ws, p, j, a2 } = sample();
    const r = resolveSelection(deleteActivity(ws, j, a2), p, {
      kind: 'activity',
      jobcardId: j,
      id: a2,
    });
    expect(r?.selection).toEqual({ kind: 'jobcard', id: j });
  });

  it('falls back to the project when the jobcard was deleted', () => {
    const { ws, p, j } = sample();
    expect(
      resolveSelection(deleteJobcard(ws, j), p, { kind: 'jobcard', id: j })?.selection,
    ).toEqual({
      kind: 'project',
    });
  });

  it('does not resolve items of another project', () => {
    const { ws, other, w } = sample();
    expect(resolveSelection(ws, other, { kind: 'workpack', id: w })?.selection).toEqual({
      kind: 'project',
    });
  });

  it('returns undefined for a missing project', () => {
    const { ws } = sample();
    expect(resolveSelection(ws, '00000000-0000-4000-8000-000000000099', { kind: 'project' })).toBe(
      undefined,
    );
  });
});

describe('projectSummary', () => {
  it('counts workpacks and jobcards', () => {
    const { ws, p, other } = sample();
    expect(
      projectSummary(
        ws,
        ws.projects.find((x) => x.id === p)!,
      ),
    ).toBe('1 workpack · 1 jobcard');
    expect(
      projectSummary(
        ws,
        ws.projects.find((x) => x.id === other)!,
      ),
    ).toBe('0 workpacks · 0 jobcards');
  });
});

describe('sameSelection', () => {
  it('compares kind and id', () => {
    const id = '00000000-0000-4000-8000-000000000001';
    expect(sameSelection({ kind: 'project' }, { kind: 'project' })).toBe(true);
    expect(sameSelection({ kind: 'jobcard', id }, { kind: 'jobcard', id })).toBe(true);
    expect(sameSelection({ kind: 'jobcard', id }, { kind: 'workpack', id })).toBe(false);
  });
});
