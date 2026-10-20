import type { Keyplan } from '@jobcard/domain';
import { useRef, useState } from 'react';
import { MAX_KEYPLAN_BYTES, type AssetStore } from '../assets';
import type { EditorActions } from '../editor-actions';
import { useAssetUrl } from '../use-asset-url';

interface Props {
  workpackId: string;
  keyplan: Keyplan | undefined;
  assets: AssetStore;
  actions: EditorActions;
}

/** Upload, replace and remove the keyplan picture of a workpack. */
export function KeyplanField({ workpackId, keyplan, assets, actions }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const image = useAssetUrl(assets, keyplan?.assetId);

  const run = async (task: () => Promise<string | undefined | void>) => {
    setBusy(true);
    try {
      setError((await task()) ?? undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="field">
      <label htmlFor="workpack-keyplan">Keyplan</label>
      {image.status === 'ready' && (
        <img className="keyplan-thumb" src={image.url} alt="Keyplan of this workpack" />
      )}
      <div className="keyplan-actions">
        <input
          ref={input}
          id="workpack-keyplan"
          type="file"
          className="visually-hidden"
          accept="image/png,image/jpeg"
          disabled={busy}
          aria-describedby="workpack-keyplan-help"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = ''; // so choosing the same file again still triggers a change
            if (file) void run(() => actions.uploadKeyplan(workpackId, file));
          }}
        />
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {keyplan ? 'Replace image…' : 'Upload image…'}
        </button>
        {keyplan && (
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={() => void run(() => actions.removeKeyplan(workpackId))}
          >
            Remove
          </button>
        )}
        {keyplan?.fileName && <span className="hint">{keyplan.fileName}</span>}
      </div>
      {error ? (
        <span id="workpack-keyplan-help" className="field-error" role="alert">
          {error}
        </span>
      ) : image.status === 'missing' ? (
        <span id="workpack-keyplan-help" className="field-error" role="alert">
          The image is missing from this browser's storage. Upload it again.
        </span>
      ) : (
        <span id="workpack-keyplan-help" className="hint">
          A PNG or JPEG sketch of the platform with the module highlighted, up to{' '}
          {MAX_KEYPLAN_BYTES / (1024 * 1024)} MB. Printed on the cover page of every jobcard.
        </span>
      )}
    </div>
  );
}
