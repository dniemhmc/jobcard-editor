import type { Workspace } from '@jobcard/domain';
import { useCallback, useRef, useState } from 'react';

/**
 * The workspace as state, plus `latest()`: the newest value even when read from
 * an action that started before the last change (for example one that waited
 * for an image to be stored). A closure over the state would be out of date.
 */
export function useWorkspaceState(initial: Workspace) {
  const [workspace, setState] = useState(initial);
  const newest = useRef(initial);
  const setWorkspace = useCallback((next: Workspace) => {
    newest.current = next;
    setState(next);
  }, []);
  const latest = useCallback(() => newest.current, []);
  return { workspace, setWorkspace, latest };
}
