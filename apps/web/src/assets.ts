import { Keyplan, type Id } from '@jobcard/domain';

/**
 * Where the editor keeps the bytes of uploaded images (for now the keyplan).
 * Records only hold an `assetId` reference. For now the browser (IndexedDB); in
 * Phase 1b the API with Azure Blob Storage takes its place behind the same
 * interface (ADR 0005).
 *
 * The asset store and the workspace store are separate and not saved together,
 * so callers order their writes: write the asset before the record that points
 * to it, and delete an asset only after the record no longer does.
 */
export interface AssetStore {
  put(id: Id, blob: Blob): Promise<void>;
  /** The stored blob, or undefined when there is none for this id. */
  get(id: Id): Promise<Blob | undefined>;
  /** Deleting an id that is not stored is not an error. */
  delete(id: Id): Promise<void>;
}

export const ASSET_DB_NAME = 'jobcard-editor-assets';
const OBJECT_STORE = 'assets';

/** An asset store in IndexedDB. The database is opened on first use. */
export function indexedDbAssetStore(factory: IDBFactory, dbName = ASSET_DB_NAME): AssetStore {
  let opened: Promise<IDBDatabase> | undefined;

  const open = (): Promise<IDBDatabase> => {
    opened ??= new Promise<IDBDatabase>((resolve, reject) => {
      const request = factory.open(dbName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(OBJECT_STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error ?? new Error('The asset database failed to open'));
      request.onblocked = () => reject(new Error('The asset database is blocked'));
    }).catch((error: unknown) => {
      opened = undefined; // allow a retry after a failed open
      throw error;
    });
    return opened;
  };

  /** Runs one request in its own transaction and resolves when the transaction completes. */
  const run = async <T>(
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> => {
    const db = await open();
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(OBJECT_STORE, mode);
      const request = action(tx.objectStore(OBJECT_STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () =>
        reject(tx.error ?? request.error ?? new Error('The asset transaction failed'));
      tx.onabort = () => reject(tx.error ?? new Error('The asset transaction was aborted'));
    });
  };

  return {
    async put(id, blob) {
      await run('readwrite', (store) => store.put(blob, id));
    },
    async get(id) {
      const value: unknown = await run('readonly', (store) => store.get(id));
      return value instanceof Blob ? value : undefined;
    },
    async delete(id) {
      await run('readwrite', (store) => store.delete(id));
    },
  };
}

/** An asset store in memory, for tests. */
export function inMemoryAssetStore(): AssetStore {
  const blobs = new Map<Id, Blob>();
  return {
    put: (id, blob) => {
      blobs.set(id, blob);
      return Promise.resolve();
    },
    get: (id) => Promise.resolve(blobs.get(id)),
    delete: (id) => {
      blobs.delete(id);
      return Promise.resolve();
    },
  };
}

/** Largest keyplan file the editor accepts. */
export const MAX_KEYPLAN_BYTES = 5 * 1024 * 1024;

type KeyplanMediaType = Keyplan['mediaType'];

const KEYPLAN_TYPES: readonly string[] = Keyplan.shape.mediaType.options;

const EXTENSION_TYPES = new Map<string, KeyplanMediaType>([
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
]);

/** What the editor needs to know about a chosen file to validate it. */
export interface PickedFile {
  /** Media type as reported by the browser; empty when it reports none. */
  type: string;
  size: number;
  /** File name, used to find the type when the browser reports none. */
  name?: string;
}

/**
 * The keyplan media type of a chosen file, or undefined when it is not a PNG or
 * JPEG. Case does not matter (`IMAGE/PNG`, `scan.JPG`). The extension is only
 * used when the browser reports no type; a reported type is never overridden.
 */
export function keyplanMediaType(
  file: Pick<PickedFile, 'type' | 'name'>,
): KeyplanMediaType | undefined {
  const reported = file.type.trim().toLowerCase();
  if (reported)
    return KEYPLAN_TYPES.find((type) => type === reported) as KeyplanMediaType | undefined;
  const parts = file.name?.split('.') ?? [];
  const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;
  return extension === undefined ? undefined : EXTENSION_TYPES.get(extension);
}

/** Why a chosen file cannot be used as a keyplan, or undefined when it can. */
export function validateKeyplanFile(file: PickedFile): string | undefined {
  if (!keyplanMediaType(file)) return 'The keyplan must be a PNG or JPEG image.';
  if (file.size === 0) return 'The file is empty.';
  if (file.size > MAX_KEYPLAN_BYTES) {
    return `The file is too large: the keyplan can be at most ${MAX_KEYPLAN_BYTES / (1024 * 1024)} MB.`;
  }
  return undefined;
}
