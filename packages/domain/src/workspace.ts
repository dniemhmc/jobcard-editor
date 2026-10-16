import { z } from 'zod';
import { SCHEMA_VERSION, type Id } from './common';
import { Jobcard } from './jobcard';
import { Project } from './project';
import { Workpack } from './workpack';

/**
 * All records the editor works on: the projects, workpacks and jobcards as
 * separate records, exactly as they are stored (ADR 0005). This is the shape
 * the editor saves until persistence moves to the API (roadmap Phase 1b).
 */
export const Workspace = z.object({
  projects: z.array(Project),
  workpacks: z.array(Workpack),
  jobcards: z.array(Jobcard),
});
export type Workspace = z.infer<typeof Workspace>;

export const emptyWorkspace = (): Workspace => ({ projects: [], workpacks: [], jobcards: [] });

/** Generates a new record id (a UUID). Injected for deterministic tests. */
export type NewId = () => Id;

/** Result of an operation that creates a record: the new workspace and the new id. */
export interface Created {
  workspace: Workspace;
  id: Id;
}

export function findProject(ws: Workspace, id: Id): Project | undefined {
  return ws.projects.find((p) => p.id === id);
}

export function findWorkpack(ws: Workspace, id: Id): Workpack | undefined {
  return ws.workpacks.find((w) => w.id === id);
}

export function findJobcard(ws: Workspace, id: Id): Jobcard | undefined {
  return ws.jobcards.find((j) => j.id === id);
}

/** Workpacks of a project, in the project's order. */
export function workpacksOf(ws: Workspace, project: Project): Workpack[] {
  return project.workpackIds.flatMap((id) => findWorkpack(ws, id) ?? []);
}

/** Jobcards of a workpack, in the workpack's order. */
export function jobcardsOf(ws: Workspace, workpack: Workpack): Jobcard[] {
  return workpack.jobcardIds.flatMap((id) => findJobcard(ws, id) ?? []);
}

/** The workpack that holds a jobcard. */
export function workpackOfJobcard(ws: Workspace, jobcardId: Id): Workpack | undefined {
  return ws.workpacks.find((w) => w.jobcardIds.includes(jobcardId));
}

/** The project that holds a workpack. */
export function projectOfWorkpack(ws: Workspace, workpackId: Id): Project | undefined {
  return ws.projects.find((p) => p.workpackIds.includes(workpackId));
}

/**
 * Moves the item at `index` by `delta` places (-1 = up, +1 = down), clamped to
 * the list. Always returns a new array.
 */
export function moveInList<T>(list: readonly T[], index: number, delta: number): T[] {
  const target = Math.min(Math.max(index + delta, 0), list.length - 1);
  if (index < 0 || target === index) return [...list];
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item as T);
  return next;
}

function moveId(ids: readonly Id[], id: Id, delta: number): Id[] {
  return moveInList(ids, ids.indexOf(id), delta);
}

function insertAfter<T>(list: readonly T[], item: T, afterIndex: number): T[] {
  if (afterIndex < 0) return [...list, item];
  return [...list.slice(0, afterIndex + 1), item, ...list.slice(afterIndex + 1)];
}

// Each update re-parses the changed record, so names are trimmed and invalid
// input (an empty name) throws instead of being stored.

function updateProject(ws: Workspace, id: Id, fn: (p: Project) => Project): Workspace {
  return {
    ...ws,
    projects: ws.projects.map((p) => (p.id === id ? Project.parse(fn(p)) : p)),
  };
}

function updateWorkpack(ws: Workspace, id: Id, fn: (w: Workpack) => Workpack): Workspace {
  return {
    ...ws,
    workpacks: ws.workpacks.map((w) => (w.id === id ? Workpack.parse(fn(w)) : w)),
  };
}

function updateJobcard(ws: Workspace, id: Id, fn: (j: Jobcard) => Jobcard): Workspace {
  return {
    ...ws,
    jobcards: ws.jobcards.map((j) => (j.id === id ? Jobcard.parse(fn(j)) : j)),
  };
}

// Projects

export function createProject(ws: Workspace, name: string, newId: NewId): Created {
  const project = Project.parse({
    schemaVersion: SCHEMA_VERSION,
    id: newId(),
    name,
    workpackIds: [],
  });
  return { workspace: { ...ws, projects: [...ws.projects, project] }, id: project.id };
}

export function renameProject(ws: Workspace, id: Id, name: string): Workspace {
  return updateProject(ws, id, (p) => ({ ...p, name }));
}

/** Deletes a project with all its workpacks and their jobcards. */
export function deleteProject(ws: Workspace, id: Id): Workspace {
  const project = findProject(ws, id);
  if (!project) return ws;
  const without = project.workpackIds.reduce(deleteWorkpack, ws);
  return { ...without, projects: without.projects.filter((p) => p.id !== id) };
}

// Workpacks

export function addWorkpack(ws: Workspace, projectId: Id, title: string, newId: NewId): Created {
  const workpack = Workpack.parse({
    schemaVersion: SCHEMA_VERSION,
    id: newId(),
    title,
    jobcardIds: [],
  });
  const next = updateProject(ws, projectId, (p) => ({
    ...p,
    workpackIds: [...p.workpackIds, workpack.id],
  }));
  return { workspace: { ...next, workpacks: [...next.workpacks, workpack] }, id: workpack.id };
}

export function renameWorkpack(ws: Workspace, id: Id, title: string): Workspace {
  return updateWorkpack(ws, id, (w) => ({ ...w, title }));
}

export function moveWorkpack(ws: Workspace, id: Id, delta: number): Workspace {
  const project = projectOfWorkpack(ws, id);
  if (!project) return ws;
  return updateProject(ws, project.id, (p) => ({
    ...p,
    workpackIds: moveId(p.workpackIds, id, delta),
  }));
}

/** Deletes a workpack with all its jobcards. */
export function deleteWorkpack(ws: Workspace, id: Id): Workspace {
  const workpack = findWorkpack(ws, id);
  if (!workpack) return ws;
  return {
    projects: ws.projects.map((p) =>
      p.workpackIds.includes(id) ? { ...p, workpackIds: p.workpackIds.filter((w) => w !== id) } : p,
    ),
    workpacks: ws.workpacks.filter((w) => w.id !== id),
    jobcards: ws.jobcards.filter((j) => !workpack.jobcardIds.includes(j.id)),
  };
}

// Jobcards

export function addJobcard(ws: Workspace, workpackId: Id, title: string, newId: NewId): Created {
  const jobcard = Jobcard.parse({
    schemaVersion: SCHEMA_VERSION,
    id: newId(),
    title,
    activities: [],
  });
  const next = updateWorkpack(ws, workpackId, (w) => ({
    ...w,
    jobcardIds: [...w.jobcardIds, jobcard.id],
  }));
  return { workspace: { ...next, jobcards: [...next.jobcards, jobcard] }, id: jobcard.id };
}

export function renameJobcard(ws: Workspace, id: Id, title: string): Workspace {
  return updateJobcard(ws, id, (j) => ({ ...j, title }));
}

export function moveJobcard(ws: Workspace, id: Id, delta: number): Workspace {
  const workpack = workpackOfJobcard(ws, id);
  if (!workpack) return ws;
  return updateWorkpack(ws, workpack.id, (w) => ({
    ...w,
    jobcardIds: moveId(w.jobcardIds, id, delta),
  }));
}

export function deleteJobcard(ws: Workspace, id: Id): Workspace {
  return {
    ...ws,
    workpacks: ws.workpacks.map((w) =>
      w.jobcardIds.includes(id) ? { ...w, jobcardIds: w.jobcardIds.filter((j) => j !== id) } : w,
    ),
    jobcards: ws.jobcards.filter((j) => j.id !== id),
  };
}

// Activities

/**
 * Adds an activity to a jobcard: directly after the activity `afterId` when
 * given (quick entry while typing), otherwise at the end.
 */
export function addActivity(
  ws: Workspace,
  jobcardId: Id,
  name: string,
  newId: NewId,
  afterId?: Id,
): Created {
  const id = newId();
  const next = updateJobcard(ws, jobcardId, (j) => ({
    ...j,
    activities: insertAfter(
      j.activities,
      { id, name },
      afterId ? j.activities.findIndex((a) => a.id === afterId) : -1,
    ),
  }));
  return { workspace: next, id };
}

export function renameActivity(ws: Workspace, jobcardId: Id, id: Id, name: string): Workspace {
  return updateJobcard(ws, jobcardId, (j) => ({
    ...j,
    activities: j.activities.map((a) => (a.id === id ? { ...a, name } : a)),
  }));
}

export function moveActivity(ws: Workspace, jobcardId: Id, id: Id, delta: number): Workspace {
  return updateJobcard(ws, jobcardId, (j) => ({
    ...j,
    activities: moveInList(
      j.activities,
      j.activities.findIndex((a) => a.id === id),
      delta,
    ),
  }));
}

export function deleteActivity(ws: Workspace, jobcardId: Id, id: Id): Workspace {
  return updateJobcard(ws, jobcardId, (j) => ({
    ...j,
    activities: j.activities.filter((a) => a.id !== id),
  }));
}
