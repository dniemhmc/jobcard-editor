import { emptyWorkspace, Workspace } from '@jobcard/domain';

/**
 * Where the editor keeps its data. For now the browser (localStorage); in
 * Phase 1b the API with PostgreSQL takes its place behind the same interface.
 */
export interface WorkspaceStore {
  load(): LoadResult;
  /** Throws when the data could not be saved (for example storage full). */
  save(workspace: Workspace): void;
}

export interface LoadResult {
  workspace: Workspace;
  /** Set when stored data could not be read; it was kept under a backup key. */
  warning?: string;
}

export const STORAGE_KEY = 'jobcard-editor/workspace';
export const BACKUP_KEY = 'jobcard-editor/workspace-unreadable';

/** A store in browser storage. Data read back is validated with the domain schema. */
export function browserStore(storage: Storage, key = STORAGE_KEY): WorkspaceStore {
  return {
    load() {
      const raw = storage.getItem(key);
      if (raw === null) return { workspace: emptyWorkspace() };
      const parsed = Workspace.safeParse(safeJson(raw));
      if (parsed.success) return { workspace: parsed.data };
      // Never overwrite data we cannot read: keep a copy before starting empty.
      storage.setItem(BACKUP_KEY, raw);
      return {
        workspace: emptyWorkspace(),
        warning: 'Saved data could not be read. A copy was kept; starting with no projects.',
      };
    },
    save(workspace) {
      storage.setItem(key, JSON.stringify(workspace));
    },
  };
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
