import { emptyWorkspace, createProject } from '@jobcard/domain';
import { describe, expect, it } from 'vitest';
import { BACKUP_KEY, browserStore, STORAGE_KEY } from './storage';

/** In-memory stand-in for window.localStorage. */
function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, v),
  };
}

const newId = () => '00000000-0000-4000-8000-000000000001';

describe('browserStore', () => {
  it('starts empty', () => {
    expect(browserStore(memoryStorage()).load()).toEqual({ workspace: emptyWorkspace() });
  });

  it('loads what it saved', () => {
    const storage = memoryStorage();
    const { workspace } = createProject(emptyWorkspace(), 'Project A', newId);
    browserStore(storage).save(workspace);
    expect(browserStore(storage).load()).toEqual({ workspace });
  });

  it('keeps unreadable data as a backup and starts empty', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, '{"projects": "nope"}');
    const result = browserStore(storage).load();
    expect(result.workspace).toEqual(emptyWorkspace());
    expect(result.warning).toBeDefined();
    expect(storage.getItem(BACKUP_KEY)).toBe('{"projects": "nope"}');
  });

  it('treats invalid JSON as unreadable', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, '{');
    expect(browserStore(storage).load().warning).toBeDefined();
  });
});
