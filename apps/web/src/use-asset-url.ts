import type { Id } from '@jobcard/domain';
import { useEffect, useState } from 'react';
import type { AssetStore } from './assets';

/** What is known about the image of an asset id. */
export type AssetUrl =
  | { status: 'none' }
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'ready'; url: string };

interface Loaded {
  assetId: Id;
  result: { status: 'missing' } | { status: 'ready'; url: string };
}

/**
 * The URL to show the image of `assetId` with (a blob: URL), or why there is
 * none. The URL is released when the id changes or the component goes away.
 */
export function useAssetUrl(assets: AssetStore, assetId: Id | undefined): AssetUrl {
  const [loaded, setLoaded] = useState<Loaded>();

  useEffect(() => {
    if (!assetId) return;
    let cancelled = false;
    let url: string | undefined;
    assets
      .get(assetId)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) return setLoaded({ assetId, result: { status: 'missing' } });
        url = URL.createObjectURL(blob);
        setLoaded({ assetId, result: { status: 'ready', url } });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ assetId, result: { status: 'missing' } });
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [assets, assetId]);

  if (!assetId) return { status: 'none' };
  return loaded?.assetId === assetId ? loaded.result : { status: 'loading' };
}
