import { createProject, type Id, type Workspace } from '@jobcard/domain';
import { renderActivityHtml, renderJobcardHtml } from '@jobcard/pdf';
import { useState } from 'react';
import { Details } from './components/Details';
import { OpenProject } from './components/OpenProject';
import { Preview } from './components/Preview';
import { Splitter } from './components/Splitter';
import { ProjectTree } from './components/ProjectTree';
import { createEditorActions } from './editor-actions';
import {
  LAYOUT_KEY,
  parseLayout,
  PREVIEW_WIDTH,
  previewScale,
  resizePreview,
  resizeTree,
  TREE_WIDTH,
  type Layout,
} from './layout';
import { breadcrumb, resolveSelection, type Selection } from './selection';
import type { WorkspaceStore } from './storage';

type SaveState = 'idle' | 'saved' | 'failed';

const newId = () => crypto.randomUUID();

function loadLayout(): Layout {
  try {
    return parseLayout(window.localStorage.getItem(LAYOUT_KEY));
  } catch {
    return parseLayout(null);
  }
}

function saveLayout(layout: Layout) {
  try {
    window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  } catch {
    // A layout preference that cannot be stored is not worth an error.
  }
}

export function App({ store }: { store: WorkspaceStore }) {
  const [loaded] = useState(() => store.load());
  const [workspace, setWorkspace] = useState<Workspace>(loaded.workspace);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [projectId, setProjectId] = useState<Id>();
  const [selection, setSelection] = useState<Selection>({ kind: 'project' });
  const [focusName, setFocusName] = useState(false);
  const [layout, setLayout] = useState(loadLayout);

  const changeLayout = (fn: (l: Layout) => Layout) => {
    const next = fn(layout);
    setLayout(next);
    saveLayout(next);
  };

  const update = (next: Workspace) => {
    setWorkspace(next);
    try {
      store.save(next);
      setSaveState('saved');
    } catch {
      setSaveState('failed');
    }
  };

  const openProject = (id: Id) => {
    setProjectId(id);
    setSelection({ kind: 'project' });
    setFocusName(false);
  };

  const actions =
    projectId &&
    createEditorActions({
      projectId,
      workspace: () => workspace,
      update,
      select: (s, focus = false) => {
        setSelection(s);
        setFocusName(focus);
      },
      closeProject: () => setProjectId(undefined),
      confirm: (message) => window.confirm(message),
      newId,
    });

  const resolved = projectId ? resolveSelection(workspace, projectId, selection) : undefined;

  const preview = resolved?.jobcard
    ? resolved.activity
      ? {
          title: 'Live PDF preview: activity',
          html: renderActivityHtml(resolved.jobcard, resolved.activity),
        }
      : { title: 'Live PDF preview: jobcard', html: renderJobcardHtml(resolved.jobcard) }
    : undefined;

  const columns = [
    `${layout.treeWidth}px`,
    'auto',
    'minmax(320px, 1fr)',
    ...(preview ? ['auto', `${layout.previewWidth}px`] : []),
  ].join(' ');

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">Jobcards</span>
        <span className="crumbs">
          {resolved && breadcrumb(resolved).map((part, i) => <span key={i}>{part}</span>)}
        </span>
        <span className={`save-state ${saveState}`} role="status">
          {saveState === 'saved' && 'Saved in this browser'}
          {saveState === 'failed' && 'Not saved: browser storage is full or blocked'}
        </span>
        {resolved && (
          <button type="button" className="btn" onClick={() => setProjectId(undefined)}>
            ⇄ Switch project
          </button>
        )}
      </header>
      {loaded.warning && <div className="banner">{loaded.warning}</div>}

      {resolved && actions ? (
        <div className="workarea" style={{ gridTemplateColumns: columns }}>
          <ProjectTree workspace={workspace} resolved={resolved} actions={actions} />
          <Splitter
            label="Resize project tree"
            width={layout.treeWidth}
            direction={1}
            min={TREE_WIDTH.min}
            max={TREE_WIDTH.max}
            onResize={(w) => changeLayout((l) => resizeTree(l, w))}
          />
          <div className="main">
            <Details resolved={resolved} actions={actions} focusName={focusName} />
          </div>
          {preview && (
            <>
              <Splitter
                label="Resize PDF preview"
                width={layout.previewWidth}
                direction={-1}
                min={PREVIEW_WIDTH.min}
                max={PREVIEW_WIDTH.max}
                onResize={(w) => changeLayout((l) => resizePreview(l, w))}
              />
              <Preview
                title={preview.title}
                html={preview.html}
                scale={previewScale(layout.previewWidth)}
              />
            </>
          )}
        </div>
      ) : (
        <OpenProject
          workspace={workspace}
          onOpen={openProject}
          onCreate={(name) => {
            const result = createProject(workspace, name, newId);
            update(result.workspace);
            openProject(result.id);
          }}
        />
      )}
    </div>
  );
}
