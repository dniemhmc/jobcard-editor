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
  Keyplan,
  moveActivity,
  moveJobcard,
  moveWorkpack,
  renameActivity,
  renameJobcard,
  renameProject,
  renameWorkpack,
  setJobcardNumber,
  setProjectJobNumber,
  setWorkpackDate,
  setWorkpackDepartment,
  setWorkpackKeyplan,
  setWorkpackModule,
  setWorkpackRevision,
  type Created,
  type Id,
  type NewId,
  type Workspace,
} from '@jobcard/domain';
import { validateKeyplanFile, type AssetStore, type PickedFile } from './assets';
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
  /** Sets the module of a workpack; an empty value clears it. */
  setWorkpackModule: (id: Id, module: string) => void;
  /** Sets the department of a workpack; an empty value clears it. */
  setWorkpackDepartment: (id: Id, department: string) => void;
  /** Sets the revision of a workpack; an empty value clears it. */
  setWorkpackRevision: (id: Id, revision: string) => void;
  /** Sets the date (ISO, YYYY-MM-DD) of a workpack; an empty value clears it. */
  setWorkpackDate: (id: Id, date: string) => void;
  /**
   * Stores a chosen image as the keyplan of a workpack, replacing any earlier
   * one. Resolves to a message when the file cannot be used, otherwise undefined.
   */
  uploadKeyplan: (workpackId: Id, file: KeyplanFile) => Promise<string | undefined>;
  /** Removes the keyplan of a workpack. */
  removeKeyplan: (workpackId: Id) => Promise<void>;
  moveWorkpack: (id: Id, delta: number) => void;
  deleteWorkpack: (id: Id) => void;
  addJobcard: (workpackId: Id) => void;
  renameJobcard: (id: Id, title: string) => void;
  /** Sets the JC number of a jobcard; an empty value clears it. */
  setJobcardNumber: (id: Id, jcNumber: string) => void;
  moveJobcard: (id: Id, delta: number) => void;
  deleteJobcard: (id: Id) => void;
  /** Adds an activity at the end, or directly after `afterId`. */
  addActivity: (jobcardId: Id, afterId?: Id) => void;
  renameActivity: (jobcardId: Id, id: Id, name: string) => void;
  moveActivity: (jobcardId: Id, id: Id, delta: number) => void;
  deleteActivity: (jobcardId: Id, id: Id) => void;
}

/** A file chosen by the user: the browser's `File` fits this. */
export type KeyplanFile = Blob & PickedFile & { name: string };

export const KEYPLAN_STORE_ERROR = 'The image could not be stored in this browser.';

export interface EditorDeps {
  projectId: Id;
  /** Current workspace (read when an action runs). */
  workspace: () => Workspace;
  /** Stores a changed workspace (state + save). Returns whether it was saved. */
  update: (workspace: Workspace) => boolean;
  /** Where the image bytes of keyplans are kept. */
  assets: AssetStore;
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
  const { projectId, workspace, update, assets, select, confirm, newId } = deps;
  const change = (fn: (ws: Workspace) => Workspace) => update(fn(workspace()));
  // Keyplan images are in a store of their own. A record that is saved never
  // points to a missing image: write an image before the record that points to
  // it, and delete an image only after the record without it was saved. A
  // failure then leaves at worst an unused image behind.
  const deleteAssets = async (ids: Id[]) => {
    await Promise.allSettled(ids.map((id) => assets.delete(id)));
  };
  const keyplanAssetIds = (ws: Workspace, workpackIds: Id[]) =>
    workpackIds.flatMap((id) => findWorkpack(ws, id)?.keyplan?.assetId ?? []);
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
      const assetIds = keyplanAssetIds(workspace(), project.workpackIds);
      const saved = update(deleteProject(workspace(), projectId));
      deps.closeProject();
      if (saved) void deleteAssets(assetIds);
    },

    addWorkpack: () => {
      const result = addWorkpack(workspace(), projectId, NEW_WORKPACK, newId);
      created(result, { kind: 'workpack', id: result.id });
    },
    renameWorkpack: (id, title) => change((ws) => renameWorkpack(ws, id, title)),
    setWorkpackModule: (id, module) => change((ws) => setWorkpackModule(ws, id, module)),
    setWorkpackDepartment: (id, department) =>
      change((ws) => setWorkpackDepartment(ws, id, department)),
    setWorkpackRevision: (id, revision) => change((ws) => setWorkpackRevision(ws, id, revision)),
    setWorkpackDate: (id, date) => change((ws) => setWorkpackDate(ws, id, date)),
    uploadKeyplan: async (workpackId, file) => {
      const problem = validateKeyplanFile(file);
      if (problem) return problem;
      const assetId = newId();
      try {
        await assets.put(assetId, file);
      } catch {
        return KEYPLAN_STORE_ERROR;
      }
      // The workspace may have changed while the image was being stored.
      const replaced = findWorkpack(workspace(), workpackId)?.keyplan?.assetId;
      if (!findWorkpack(workspace(), workpackId)) {
        await deleteAssets([assetId]);
        return undefined;
      }
      const keyplan = Keyplan.parse({
        assetId,
        mediaType: file.type,
        ...(file.name.trim() ? { fileName: file.name } : {}),
      });
      const saved = update(setWorkpackKeyplan(workspace(), workpackId, keyplan));
      if (saved && replaced) await deleteAssets([replaced]);
      return undefined;
    },
    removeKeyplan: async (workpackId) => {
      const old = findWorkpack(workspace(), workpackId)?.keyplan;
      if (!old) return;
      const saved = update(setWorkpackKeyplan(workspace(), workpackId, undefined));
      if (saved) await deleteAssets([old.assetId]);
    },
    moveWorkpack: (id, delta) => change((ws) => moveWorkpack(ws, id, delta)),
    deleteWorkpack: (id) => {
      const workpack = findWorkpack(workspace(), id);
      if (!workpack) return;
      const jobcards = count(workpack.jobcardIds.length, 'jobcard', 'jobcards');
      if (!confirm(`Delete workpack "${workpack.title}" and its ${jobcards}?`)) return;
      const assetIds = keyplanAssetIds(workspace(), [id]);
      const saved = update(deleteWorkpack(workspace(), id));
      select({ kind: 'project' });
      if (saved) void deleteAssets(assetIds);
    },

    addJobcard: (workpackId) => {
      const result = addJobcard(workspace(), workpackId, NEW_JOBCARD, newId);
      created(result, { kind: 'jobcard', id: result.id });
    },
    renameJobcard: (id, title) => change((ws) => renameJobcard(ws, id, title)),
    setJobcardNumber: (id, jcNumber) => change((ws) => setJobcardNumber(ws, id, jcNumber)),
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
