import {
  createProject,
  emptyWorkspace,
  findJobcard,
  findProject,
  findWorkpack,
  type Workspace,
} from '@jobcard/domain';
import { describe, expect, it } from 'vitest';
import { createEditorActions, NEW_ACTIVITY, type EditorDeps } from './editor-actions';
import type { Selection } from './selection';

function setup(confirmAnswer = true) {
  let n = 0;
  const newId = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;
  const project = createProject(emptyWorkspace(), 'Project A', newId);
  let ws: Workspace = project.workspace;
  const selections: [Selection, boolean | undefined][] = [];
  const confirms: string[] = [];
  let closed = false;
  const deps: EditorDeps = {
    projectId: project.id,
    workspace: () => ws,
    update: (next) => (ws = next),
    select: (s, focus) => selections.push([s, focus]),
    closeProject: () => (closed = true),
    confirm: (message) => (confirms.push(message), confirmAnswer),
    newId,
  };
  return {
    actions: createEditorActions(deps),
    ws: () => ws,
    projectId: project.id,
    lastSelection: () => selections.at(-1),
    confirms,
    closed: () => closed,
  };
}

describe('editor actions', () => {
  it('sets and clears the job number of the open project', () => {
    const t = setup();
    t.actions.setProjectJobNumber('PO-1234');
    expect(findProject(t.ws(), t.projectId)?.jobNumber).toBe('PO-1234');
    t.actions.setProjectJobNumber('');
    expect(findProject(t.ws(), t.projectId)).not.toHaveProperty('jobNumber');
  });

  it('sets and clears the module of a workpack and the JC number of a jobcard', () => {
    const t = setup();
    t.actions.addWorkpack();
    const workpackId = t.ws().workpacks[0]!.id;
    t.actions.addJobcard(workpackId);
    const jobcardId = t.ws().jobcards[0]!.id;
    t.actions.setWorkpackModule(workpackId, 'M12');
    t.actions.setJobcardNumber(jobcardId, 'JC-007');
    expect(findWorkpack(t.ws(), workpackId)?.module).toBe('M12');
    expect(findJobcard(t.ws(), jobcardId)?.jcNumber).toBe('JC-007');
    t.actions.setWorkpackModule(workpackId, '');
    t.actions.setJobcardNumber(jobcardId, '');
    expect(findWorkpack(t.ws(), workpackId)).not.toHaveProperty('module');
    expect(findJobcard(t.ws(), jobcardId)).not.toHaveProperty('jcNumber');
  });

  it('selects a new item and focuses its name', () => {
    const t = setup();
    t.actions.addWorkpack();
    const workpackId = t.ws().workpacks[0]!.id;
    expect(t.lastSelection()).toEqual([{ kind: 'workpack', id: workpackId }, true]);
  });

  it('adds the next activity directly after the current one', () => {
    const t = setup();
    t.actions.addWorkpack();
    t.actions.addJobcard(t.ws().workpacks[0]!.id);
    const jobcardId = t.ws().jobcards[0]!.id;
    t.actions.addActivity(jobcardId);
    t.actions.addActivity(jobcardId);
    const [first] = findJobcard(t.ws(), jobcardId)!.activities;
    t.actions.renameActivity(jobcardId, first!.id, 'First');
    t.actions.addActivity(jobcardId, first!.id);
    expect(findJobcard(t.ws(), jobcardId)!.activities.map((a) => a.name)).toEqual([
      'First',
      NEW_ACTIVITY,
      NEW_ACTIVITY,
    ]);
    expect(t.lastSelection()?.[0]).toMatchObject({ kind: 'activity', jobcardId });
  });

  it('asks before deleting and names what goes with it', () => {
    const t = setup();
    t.actions.addWorkpack();
    const workpackId = t.ws().workpacks[0]!.id;
    t.actions.addJobcard(workpackId);
    t.actions.deleteWorkpack(workpackId);
    expect(t.confirms).toEqual(['Delete workpack "New workpack" and its 1 jobcard?']);
    expect(t.ws().workpacks).toEqual([]);
    expect(t.ws().jobcards).toEqual([]);
    expect(t.lastSelection()?.[0]).toEqual({ kind: 'project' });
  });

  it('keeps everything when deletion is cancelled', () => {
    const t = setup(false);
    t.actions.addWorkpack();
    const before = t.ws();
    t.actions.deleteWorkpack(before.workpacks[0]!.id);
    expect(t.ws()).toBe(before);
  });

  it('closes the project after deleting it', () => {
    const t = setup();
    t.actions.deleteProject();
    expect(findProject(t.ws(), t.projectId)).toBeUndefined();
    expect(t.closed()).toBe(true);
  });
});
