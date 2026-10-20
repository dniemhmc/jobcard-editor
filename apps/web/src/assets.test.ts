import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import {
  type AssetStore,
  indexedDbAssetStore,
  inMemoryAssetStore,
  MAX_KEYPLAN_BYTES,
  validateKeyplanFile,
} from './assets';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const png = (text: string) => new Blob([text], { type: 'image/png' });

/** The contract every asset store has to keep, whatever it is backed by. */
function behavesLikeAnAssetStore(name: string, create: () => AssetStore) {
  describe(name, () => {
    it('returns undefined for an id that was never stored', async () => {
      expect(await create().get(id(1))).toBeUndefined();
    });

    it('returns the bytes and type that were stored', async () => {
      const store = create();
      await store.put(id(1), png('first'));
      const blob = await store.get(id(1));
      expect(blob?.type).toBe('image/png');
      expect(await blob?.text()).toBe('first');
    });

    it('keeps assets apart and replaces an asset stored again under the same id', async () => {
      const store = create();
      await store.put(id(1), png('first'));
      await store.put(id(2), png('second'));
      await store.put(id(1), png('replaced'));
      expect(await (await store.get(id(1)))?.text()).toBe('replaced');
      expect(await (await store.get(id(2)))?.text()).toBe('second');
    });

    it('deletes one asset and ignores an id that is not stored', async () => {
      const store = create();
      await store.put(id(1), png('first'));
      await store.put(id(2), png('second'));
      await store.delete(id(1));
      await store.delete(id(3));
      expect(await store.get(id(1))).toBeUndefined();
      expect(await store.get(id(2))).toBeDefined();
    });
  });
}

behavesLikeAnAssetStore('inMemoryAssetStore', inMemoryAssetStore);
behavesLikeAnAssetStore('indexedDbAssetStore', () => indexedDbAssetStore(new IDBFactory()));

describe('indexedDbAssetStore persistence', () => {
  it('serves assets to a new store on the same database, and keeps databases apart', async () => {
    const factory = new IDBFactory();
    await indexedDbAssetStore(factory).put(id(1), png('kept'));
    expect(await (await indexedDbAssetStore(factory).get(id(1)))?.text()).toBe('kept');
    expect(await indexedDbAssetStore(factory, 'other').get(id(1))).toBeUndefined();
  });

  it('rejects when the database cannot be opened, and tries again on the next call', async () => {
    const real = new IDBFactory();
    let failures = 1;
    const flaky = {
      open: (name: string, version?: number) => {
        if (failures-- > 0) throw new Error('storage blocked');
        return real.open(name, version);
      },
    } as unknown as IDBFactory;
    const store = indexedDbAssetStore(flaky);
    await expect(store.put(id(1), png('x'))).rejects.toThrow('storage blocked');
    await store.put(id(1), png('x'));
    expect(await store.get(id(1))).toBeDefined();
  });
});

describe('validateKeyplanFile', () => {
  it('accepts PNG and JPEG files up to the size limit', () => {
    expect(validateKeyplanFile({ type: 'image/png', size: 1000 })).toBeUndefined();
    expect(validateKeyplanFile({ type: 'image/jpeg', size: MAX_KEYPLAN_BYTES })).toBeUndefined();
  });

  it('rejects other file types, including SVG and GIF', () => {
    for (const type of ['image/gif', 'image/svg+xml', 'application/pdf', 'text/html', '']) {
      expect(validateKeyplanFile({ type, size: 1000 }), type).toMatch(/PNG or JPEG/);
    }
  });

  it('rejects an empty file and one over the limit', () => {
    expect(validateKeyplanFile({ type: 'image/png', size: 0 })).toMatch(/empty/);
    expect(validateKeyplanFile({ type: 'image/png', size: MAX_KEYPLAN_BYTES + 1 })).toMatch(
      /at most 5 MB/,
    );
  });
});
