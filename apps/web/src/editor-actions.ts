import {
  addActivity,
  addJobcard,
  addWorkpack,
  deleteActivity,
  deleteJobcard,
  deleteProject,
  deleteWorkpack,
  findJobcard,
  findProject,
  findWorkpack,
  moveActivity,
  moveJobcard,
  moveWorkpack,
  renameActivity,
  renameJobcard,
  renameProject,
  renameWorkpack,
  setProjectJobNumber,
  type Created,
  type Id,
  type NewId,
  type Workspace,
} from '@jobcard/domain';
import type { Selection } from './selection';

/** Everything the editor screens can do, so components stay free of editing logic. */
export interface EditorActions {
  select: (selection: Selection) => void;
  renameProject: (name: string) => void;
  /** Sets the job number of the project; an empty value clears it. */
  setProjectJobNumber: (jobNumber: string) => void;
  deleteProject: () => void;
  addWorkpack: () => void;
  renameWorkpack: (id: Id, title: string) => void;
  moveWorkpack: (id: Id, delta: number) => void;
  deleteWorkpack: (id: Id) => void;
  addJobcard: (workpackId: Id) => void;
  renameJobcard: (id: Id, title: string) => void;
  moveJobcard: (id: Id, delta: number) => void;
  deleteJobcard: (id: Id) => void;
  /** Adds an activity at the end, or directly after `afterId`. */
  addActivity: (jobcardId: Id, afterId?: Id) => void;
  renameActivity: (jobcardId: Id, id: Id, name: string) => void;
  moveActivity: (jobcardId: Id, id: Id, delta: number) => void;
  deleteActivity: (jobcardId: Id, id: Id) => void;
}

export interface EditorDeps {
  projectId: Id;
  /** Current workspace (read when an action runs). */
  workspace: () => Workspace;
  /** Stores a changed workspace (state + save). */
  update: (workspace: Workspace) => void;
  /** Selects an item; `focusName` puts the cursor in its name field (new items). */
  select: (selection: Selection, focusName?: boolean) => void;
  /** Called when the open project was deleted. */
  closeProject: () => void;
  /** Asks the user to confirm a deletion. */
  confirm: (message: string) => boolean;
  newId: NewId;
}

export const NEW_WORKPACK = 'New workpack';
export const NEW_JOBCARD = 'New jobcard';
export const NEW_ACTIVITY = 'New activity';

export function createEditorActions(deps: EditorDeps): EditorActions {
  const { projectId, workspace, update, select, confirm, newId } = deps;
  const change = (fn: (ws: Workspace) => Workspace) => update(fn(workspace()));
  const created = (result: Created, selection: Selection) => {
    update(result.workspace);
    select(selection, true);
  };
  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  return {
    select: (selection) => select(selection),

    renameProject: (name) => change((ws) => renameProject(ws, projectId, name)),
    setProjectJobNumber: (jobNumber) =>
      change((ws) => setProjectJobNumber(ws, projectId, jobNumber)),
    deleteProject: () => {
      const project = findProject(workspace(), projectId);
      if (!project) return;
      if (!confirm(`Delete project "${project.name}" with all its workpacks and jobcards?`)) return;
      change((ws) => deleteProject(ws, projectId));
      deps.closeProject();
    },

    addWorkpack: () => {
      const result = addWorkpack(workspace(), projectId, NEW_WORKPACK, newId);
      created(result, { kind: 'workpack', id: result.id });
    },
    renameWorkpack: (id, title) => change((ws) => renameWorkpack(ws, id, title)),
    moveWorkpack: (id, delta) => change((ws) => moveWorkpack(ws, id, delta)),
    deleteWorkpack: (id) => {
      const workpack = findWorkpack(workspace(), id);
      if (!workpack) return;
      const jobcards = count(workpack.jobcardIds.length, 'jobcard', 'jobcards');
      if (!confirm(`Delete workpack "${workpack.title}" and its ${jobcards}?`)) return;
      change((ws) => deleteWorkpack(ws, id));
      select({ kind: 'project' });
    },

    addJobcard: (workpackId) => {
      const result = addJobcard(workspace(), workpackId, NEW_JOBCARD, newId);
      created(result, { kind: 'jobcard', id: result.id });
    },
    renameJobcard: (id, title) => change((ws) => renameJobcard(ws, id, title)),
    moveJobcard: (id, delta) => change((ws) => moveJobcard(ws, id, delta)),
    deleteJobcard: (id) => {
      const jobcard = findJobcard(workspace(), id);
      if (!jobcard) return;
      const activities = count(jobcard.activities.length, 'activity', 'activities');
      if (!confirm(`Delete jobcard "${jobcard.title}" and its ${activities}?`)) return;
      change((ws) => deleteJobcard(ws, id));
      select({ kind: 'project' });
    },

    addActivity: (jobcardId, afterId) => {
      const result = addActivity(workspace(), jobcardId, NEW_ACTIVITY, newId, afterId);
      created(result, { kind: 'activity', jobcardId, id: result.id });
    },
    renameActivity: (jobcardId, id, name) =>
      change((ws) => renameActivity(ws, jobcardId, id, name)),
    moveActivity: (jobcardId, id, delta) => change((ws) => moveActivity(ws, jobcardId, id, delta)),
    deleteActivity: (jobcardId, id) => {
      const activity = findJobcard(workspace(), jobcardId)?.activities.find((a) => a.id === id);
      if (!activity) return;
      if (!confirm(`Delete activity "${activity.name}"?`)) return;
      change((ws) => deleteActivity(ws, jobcardId, id));
      select({ kind: 'jobcard', id: jobcardId });
    },
  };
}
