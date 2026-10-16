import {
  findJobcard,
  findProject,
  findWorkpack,
  jobcardsOf,
  projectOfWorkpack,
  workpackOfJobcard,
  workpacksOf,
  type Activity,
  type Id,
  type Jobcard,
  type Project,
  type Workpack,
  type Workspace,
} from '@jobcard/domain';

/** The item selected in the project tree. */
export type Selection =
  | { kind: 'project' }
  | { kind: 'workpack'; id: Id }
  | { kind: 'jobcard'; id: Id }
  | { kind: 'activity'; jobcardId: Id; id: Id };

/** A selection resolved against the workspace, with the records along its path. */
export interface Resolved {
  selection: Selection;
  project: Project;
  workpack?: Workpack;
  jobcard?: Jobcard;
  activity?: Activity;
}

/**
 * Resolves a selection inside a project. An item that no longer exists (it
 * was deleted) falls back to the project. Returns undefined when the project
 * itself is gone.
 */
export function resolveSelection(
  ws: Workspace,
  projectId: Id,
  selection: Selection,
): Resolved | undefined {
  const project = findProject(ws, projectId);
  if (!project) return undefined;
  const top: Resolved = { selection: { kind: 'project' }, project };

  const inProject = (workpackId: Id | undefined) =>
    workpackId !== undefined && projectOfWorkpack(ws, workpackId)?.id === projectId;

  switch (selection.kind) {
    case 'project':
      return top;
    case 'workpack': {
      const workpack = findWorkpack(ws, selection.id);
      return workpack && inProject(workpack.id) ? { selection, project, workpack } : top;
    }
    case 'jobcard':
    case 'activity': {
      const jobcardId = selection.kind === 'jobcard' ? selection.id : selection.jobcardId;
      const jobcard = findJobcard(ws, jobcardId);
      const workpack = workpackOfJobcard(ws, jobcardId);
      if (!jobcard || !workpack || !inProject(workpack.id)) return top;
      if (selection.kind === 'jobcard') return { selection, project, workpack, jobcard };
      const activity = jobcard.activities.find((a) => a.id === selection.id);
      if (!activity)
        return { selection: { kind: 'jobcard', id: jobcard.id }, project, workpack, jobcard };
      return { selection, project, workpack, jobcard, activity };
    }
  }
}

/** Activity label as shown in the tree and breadcrumb, e.g. "Activity 2". */
export function activityLabel(jobcard: Jobcard, activityId: Id): string {
  return `Activity ${jobcard.activities.findIndex((a) => a.id === activityId) + 1}`;
}

/** Breadcrumb for the top bar: project › workpack › jobcard › activity. */
export function breadcrumb(r: Resolved): string[] {
  const parts = [r.project.name];
  if (r.workpack) parts.push(r.workpack.title);
  if (r.jobcard) parts.push(r.jobcard.title);
  if (r.jobcard && r.activity) parts.push(activityLabel(r.jobcard, r.activity.id));
  return parts;
}

/** One line summary for the open project screen, e.g. "2 workpacks · 16 jobcards". */
export function projectSummary(ws: Workspace, project: Project): string {
  const workpacks = workpacksOf(ws, project);
  const jobcards = workpacks.reduce((n, w) => n + jobcardsOf(ws, w).length, 0);
  return `${plural(workpacks.length, 'workpack')} · ${plural(jobcards, 'jobcard')}`;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** Whether two selections point at the same item. */
export function sameSelection(a: Selection, b: Selection): boolean {
  if (a.kind !== b.kind) return false;
  return a.kind === 'project' || ('id' in b && 'id' in a && a.id === b.id);
}
