import { Text, type Id, type Project, type Workspace } from '@jobcard/domain';
import { useState } from 'react';
import { projectSummary } from '../selection';

interface Props {
  workspace: Workspace;
  onOpen: (id: Id) => void;
  onCreate: (name: string) => void;
}

/** Shown when the app starts: pick a project or create a new one (wireframe 00). */
export function OpenProject({ workspace, onOpen, onCreate }: Props) {
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const query = search.trim().toLowerCase();
  const projects = workspace.projects.filter((p: Project) => p.name.toLowerCase().includes(query));
  const canCreate = Text.safeParse(name).success;

  return (
    <main className="open-project">
      <h1>Open a project</h1>
      <p className="hint">
        You work on one project at a time. You can switch later from the top bar.
      </p>

      {workspace.projects.length > 0 && (
        <input
          className="input"
          type="search"
          placeholder="Search projects…"
          aria-label="Search projects"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      <ul className="project-list">
        {projects.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onOpen(p.id)}>
              <span className="project-name">{p.name}</span>
              <span className="hint">{projectSummary(workspace, p)}</span>
            </button>
          </li>
        ))}
        {projects.length === 0 && (
          <li className="empty-state">
            {workspace.projects.length === 0
              ? 'No projects yet. Create the first one below.'
              : 'No project matches your search.'}
          </li>
        )}
      </ul>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          if (canCreate) onCreate(name);
        }}
      >
        <input
          className="input"
          placeholder="New project name"
          aria-label="New project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={!canCreate}>
          + New project
        </button>
      </form>
    </main>
  );
}
