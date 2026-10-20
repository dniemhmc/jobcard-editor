import {
  createProject,
  emptyWorkspace,
  findJobcard,
  findProject,
  findWorkpack,
  type Workspace,
} from '@jobcard/domain';
import { describe, expect, it, vi } from 'vitest';
import { inMemoryAssetStore, MAX_KEYPLAN_BYTES, type AssetStore } from './assets';
import {
  createEditorActions,
  KEYPLAN_STORE_ERROR,
  NEW_ACTIVITY,
  type EditorDeps,
  type KeyplanFile,
} from './editor-actions';
import type { Selection } from './selection';

function setup(confirmAnswer = true, assets: AssetStore = inMemoryAssetStore()) {
  let n = 0;
  const newId = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;
  const project = createProject(emptyWorkspace(), 'Project A', newId);
  let ws: Workspace = project.workspace;
  const selections: [Selection, boolean | undefined][] = [];
  const confirms: string[] = [];
  let closed = false;
  let saves = true;
  const deps: EditorDeps = {
    projectId: project.id,
    workspace: () => ws,
    update: (next) => {
      ws = next;
      return saves;
    },
    assets,
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
    assets,
    /** Makes the next saves fail (or succeed again). */
    failSaves: (fail: boolean) => (saves = !fail),
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

  it('sets and clears the department and revision of a workpack', () => {
    const t = setup();
    t.actions.addWorkpack();
    const workpackId = t.ws().workpacks[0]!.id;
    t.actions.setWorkpackDepartment(workpackId, 'Decom');
    t.actions.setWorkpackRevision(workpackId, 'B');
    expect(findWorkpack(t.ws(), workpackId)).toMatchObject({ department: 'Decom', revision: 'B' });
    t.actions.setWorkpackDepartment(workpackId, '');
    t.actions.setWorkpackRevision(workpackId, '');
    expect(findWorkpack(t.ws(), workpackId)).not.toHaveProperty('department');
    expect(findWorkpack(t.ws(), workpackId)).not.toHaveProperty('revision');
  });

  it('sets and clears the date of a workpack', () => {
    const t = setup();
    t.actions.addWorkpack();
    const workpackId = t.ws().workpacks[0]!.id;
    t.actions.setWorkpackDate(workpackId, '2026-10-19');
    expect(findWorkpack(t.ws(), workpackId)?.date).toBe('2026-10-19');
    t.actions.setWorkpackDate(workpackId, '');
    expect(findWorkpack(t.ws(), workpackId)).not.toHaveProperty('date');
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

/** A chosen image file; the browser's File has the same shape. */
const imageFile = (type = 'image/png', name = 'module-a.png', bytes = 'png-bytes'): KeyplanFile =>
  Object.assign(new Blob([bytes], { type }), { name });

/** Lets asset deletions that are not awaited by the action finish. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('keyplan actions', () => {
  function withWorkpack(assets?: AssetStore) {
    const t = setup(true, assets);
    t.actions.addWorkpack();
    return { ...t, workpackId: t.ws().workpacks[0]!.id };
  }

  it('stores the image and points the workpack to it', async () => {
    const t = withWorkpack();
    expect(await t.actions.uploadKeyplan(t.workpackId, imageFile())).toBeUndefined();
    const keyplan = findWorkpack(t.ws(), t.workpackId)?.keyplan;
    expect(keyplan).toMatchObject({ mediaType: 'image/png', fileName: 'module-a.png' });
    expect(await (await t.assets.get(keyplan!.assetId))?.text()).toBe('png-bytes');
  });

  it('accepts a file the browser gave no type, by its extension, and stores it with that type', async () => {
    const t = withWorkpack();
    expect(
      await t.actions.uploadKeyplan(t.workpackId, imageFile('', 'Sketch.JPG')),
    ).toBeUndefined();
    const keyplan = findWorkpack(t.ws(), t.workpackId)?.keyplan;
    expect(keyplan?.mediaType).toBe('image/jpeg');
    expect((await t.assets.get(keyplan!.assetId))?.type).toBe('image/jpeg');
  });

  it('leaves out the file name when the file has none', async () => {
    const t = withWorkpack();
    await t.actions.uploadKeyplan(t.workpackId, imageFile('image/jpeg', ' '));
    const keyplan = findWorkpack(t.ws(), t.workpackId)?.keyplan;
    expect(keyplan?.mediaType).toBe('image/jpeg');
    expect(keyplan).not.toHaveProperty('fileName');
  });

  it('refuses a file that is not a PNG or JPEG, or is too large, and changes nothing', async () => {
    const t = withWorkpack();
    const before = t.ws();
    expect(await t.actions.uploadKeyplan(t.workpackId, imageFile('image/gif'))).toMatch(
      /PNG or JPEG/,
    );
    const huge = imageFile('image/png', 'big.png', 'x'.repeat(MAX_KEYPLAN_BYTES + 1));
    expect(await t.actions.uploadKeyplan(t.workpackId, huge)).toMatch(/too large/);
    expect(t.ws()).toBe(before);
  });

  it('reports a message and changes nothing when the image cannot be stored', async () => {
    const broken: AssetStore = {
      ...inMemoryAssetStore(),
      put: () => Promise.reject(new Error('quota exceeded')),
    };
    const t = withWorkpack(broken);
    const before = t.ws();
    expect(await t.actions.uploadKeyplan(t.workpackId, imageFile())).toBe(KEYPLAN_STORE_ERROR);
    expect(t.ws()).toBe(before);
  });

  it('removes the old image after replacing the keyplan', async () => {
    const t = withWorkpack();
    await t.actions.uploadKeyplan(t.workpackId, imageFile('image/png', 'one.png', 'one'));
    const first = findWorkpack(t.ws(), t.workpackId)!.keyplan!.assetId;
    await t.actions.uploadKeyplan(t.workpackId, imageFile('image/png', 'two.png', 'two'));
    const second = findWorkpack(t.ws(), t.workpackId)!.keyplan!.assetId;
    expect(second).not.toBe(first);
    expect(await t.assets.get(first)).toBeUndefined();
    expect(await (await t.assets.get(second))?.text()).toBe('two');
  });

  it('keeps the old image when the new keyplan could not be saved', async () => {
    const t = withWorkpack();
    await t.actions.uploadKeyplan(t.workpackId, imageFile());
    const first = findWorkpack(t.ws(), t.workpackId)!.keyplan!.assetId;
    t.failSaves(true);
    await t.actions.uploadKeyplan(t.workpackId, imageFile('image/png', 'two.png', 'two'));
    expect(await t.assets.get(first)).toBeDefined();
  });

  it('removes the new image when the workpack was deleted while it was being stored', async () => {
    const stored: string[] = [];
    const real = inMemoryAssetStore();
    let afterPut = () => {};
    const assets: AssetStore = {
      ...real,
      put: async (id, blob) => {
        await real.put(id, blob);
        stored.push(id);
        afterPut();
      },
    };
    const t = withWorkpack(assets);
    afterPut = () => t.actions.deleteWorkpack(t.workpackId);
    await t.actions.uploadKeyplan(t.workpackId, imageFile());
    expect(t.ws().workpacks).toEqual([]);
    expect(stored).toHaveLength(1);
    expect(await real.get(stored[0]!)).toBeUndefined();
  });

  it('removes the keyplan and its image', async () => {
    const t = withWorkpack();
    await t.actions.uploadKeyplan(t.workpackId, imageFile());
    const { assetId } = findWorkpack(t.ws(), t.workpackId)!.keyplan!;
    await t.actions.removeKeyplan(t.workpackId);
    expect(findWorkpack(t.ws(), t.workpackId)).not.toHaveProperty('keyplan');
    expect(await t.assets.get(assetId)).toBeUndefined();
    await expect(t.actions.removeKeyplan(t.workpackId)).resolves.toBeUndefined();
  });

  it('keeps the image when removing the keyplan could not be saved', async () => {
    const t = withWorkpack();
    await t.actions.uploadKeyplan(t.workpackId, imageFile());
    const { assetId } = findWorkpack(t.ws(), t.workpackId)!.keyplan!;
    t.failSaves(true);
    await t.actions.removeKeyplan(t.workpackId);
    expect(await t.assets.get(assetId)).toBeDefined();
  });

  it('deletes the image of a workpack that is deleted', async () => {
    const t = withWorkpack();
    await t.actions.uploadKeyplan(t.workpackId, imageFile());
    const { assetId } = findWorkpack(t.ws(), t.workpackId)!.keyplan!;
    t.actions.deleteWorkpack(t.workpackId);
    await vi.waitFor(async () => expect(await t.assets.get(assetId)).toBeUndefined());
  });

  it('deletes the images of all workpacks of a project that is deleted', async () => {
    const t = withWorkpack();
    t.actions.addWorkpack();
    const [w1, w2] = t.ws().workpacks.map((w) => w.id);
    await t.actions.uploadKeyplan(w1!, imageFile('image/png', 'a.png', 'a'));
    await t.actions.uploadKeyplan(w2!, imageFile('image/png', 'b.png', 'b'));
    const ids = t.ws().workpacks.map((w) => w.keyplan!.assetId);
    t.actions.deleteProject();
    await vi.waitFor(async () => {
      for (const id of ids) expect(await t.assets.get(id)).toBeUndefined();
    });
  });

  it('keeps the image of a deleted workpack when that could not be saved', async () => {
    const t = withWorkpack();
    await t.actions.uploadKeyplan(t.workpackId, imageFile());
    const { assetId } = findWorkpack(t.ws(), t.workpackId)!.keyplan!;
    t.failSaves(true);
    t.actions.deleteWorkpack(t.workpackId);
    await settle();
    expect(await t.assets.get(assetId)).toBeDefined();
  });
});
