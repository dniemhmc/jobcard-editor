import { createProject, type Id, type Workspace } from '@jobcard/domain';
import { renderActivityHtml, renderJobcardHtml } from '@jobcard/pdf';
import { useState } from 'react';
import { Details } from './components/Details';
import { OpenProject } from './components/OpenProject';
import { Preview } from './components/Preview';
import { ProjectTree } from './components/ProjectTree';
import { createEditorActions } from './editor-actions';
import { breadcrumb, resolveSelection, type Selection } from './selection';
import type { WorkspaceStore } from './storage';

type SaveState = 'idle' | 'saved' | 'failed';

const newId = () => crypto.randomUUID();

export function App({ store }: { store: WorkspaceStore }) {
  const [loaded] = useState(() => store.load());
  const [workspace, setWorkspace] = useState<Workspace>(loaded.workspace);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [projectId, setProjectId] = useState<Id>();
  const [selection, setSelection] = useState<Selection>({ kind: 'project' });
  const [focusName, setFocusName] = useState(false);

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
        <div className="workarea">
          <ProjectTree workspace={workspace} resolved={resolved} actions={actions} />
          <div className="main">
            <Details resolved={resolved} actions={actions} focusName={focusName} />
          </div>
          {resolved.jobcard && resolved.activity ? (
            <Preview
              title="Live PDF preview: activity"
              html={renderActivityHtml(resolved.jobcard, resolved.activity)}
            />
          ) : resolved.jobcard ? (
            <Preview title="Live PDF preview: jobcard" html={renderJobcardHtml(resolved.jobcard)} />
          ) : (
            <div />
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
