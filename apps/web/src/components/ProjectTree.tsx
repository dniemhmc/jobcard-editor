import { jobcardsOf, workpacksOf, type Workspace } from '@jobcard/domain';
import type { KeyboardEvent, ReactNode } from 'react';
import { activityLabel, sameSelection, type Resolved, type Selection } from '../selection';
import type { EditorActions } from '../editor-actions';

interface Props {
  workspace: Workspace;
  resolved: Resolved;
  actions: EditorActions;
}

/**
 * The project tree: project, workpacks, jobcards and
 * activities. Click to edit an item; the selected item can be moved with the
 * arrow buttons or Alt+↑ / Alt+↓, and deleted with ✕ or the Delete key.
 */
export function ProjectTree({ workspace, resolved, actions }: Props) {
  const { project } = resolved;
  const selected = resolved.selection;

  const row = (
    selection: Selection,
    label: ReactNode,
    move?: (delta: number) => void,
    remove?: () => void,
    canMove?: { up: boolean; down: boolean },
  ) => {
    const isSelected = sameSelection(selection, selected);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && move && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        move(e.key === 'ArrowUp' ? -1 : 1);
      } else if (e.key === 'Delete' && remove) {
        e.preventDefault();
        remove();
      }
    };
    return (
      <div className={`tree-row${isSelected ? ' selected' : ''}`}>
        <button
          type="button"
          className="tree-item"
          data-tree-id={'id' in selection ? selection.id : project.id}
          aria-current={isSelected ? 'true' : undefined}
          onClick={() => actions.select(selection)}
          onKeyDown={onKeyDown}
        >
          {label}
        </button>
        {isSelected && (move || remove) && (
          <span className="tree-actions">
            {move && (
              <>
                <button
                  type="button"
                  className="btn btn-icon"
                  aria-label="Move up"
                  title="Move up (Alt+↑)"
                  disabled={!canMove?.up}
                  onClick={() => move(-1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn-icon"
                  aria-label="Move down"
                  title="Move down (Alt+↓)"
                  disabled={!canMove?.down}
                  onClick={() => move(1)}
                >
                  ↓
                </button>
              </>
            )}
            {remove && (
              <button
                type="button"
                className="btn btn-icon"
                aria-label="Delete"
                title="Delete (Del)"
                onClick={remove}
              >
                ✕
              </button>
            )}
          </span>
        )}
      </div>
    );
  };

  const bounds = (index: number, length: number) => ({ up: index > 0, down: index < length - 1 });
  const add = (label: string, onClick: () => void) => (
    <li>
      <button type="button" className="tree-add" onClick={onClick}>
        + {label}
      </button>
    </li>
  );

  const workpacks = workpacksOf(workspace, project);

  return (
    <nav className="sidebar" aria-label="Project tree">
      <div className="sidebar-title">Project tree</div>
      <ul className="tree">
        <li>
          {row({ kind: 'project' }, project.name)}
          <ul>
            {workpacks.map((workpack, wi) => {
              const jobcards = jobcardsOf(workspace, workpack);
              return (
                <li key={workpack.id}>
                  {row(
                    { kind: 'workpack', id: workpack.id },
                    <>
                      <span className="tree-kind">Workpack: </span>
                      {workpack.title}
                    </>,
                    (d) => actions.moveWorkpack(workpack.id, d),
                    () => actions.deleteWorkpack(workpack.id),
                    bounds(wi, workpacks.length),
                  )}
                  <ul>
                    {jobcards.map((jobcard, ji) => (
                      <li key={jobcard.id}>
                        {row(
                          { kind: 'jobcard', id: jobcard.id },
                          jobcard.title,
                          (d) => actions.moveJobcard(jobcard.id, d),
                          () => actions.deleteJobcard(jobcard.id),
                          bounds(ji, jobcards.length),
                        )}
                        <ul>
                          {jobcard.activities.map((activity, ai) => (
                            <li key={activity.id}>
                              {row(
                                { kind: 'activity', jobcardId: jobcard.id, id: activity.id },
                                <>
                                  <span className="tree-kind">
                                    {activityLabel(jobcard, activity.id)}:{' '}
                                  </span>
                                  {activity.name}
                                </>,
                                (d) => actions.moveActivity(jobcard.id, activity.id, d),
                                () => actions.deleteActivity(jobcard.id, activity.id),
                                bounds(ai, jobcard.activities.length),
                              )}
                            </li>
                          ))}
                          {add('New activity', () => actions.addActivity(jobcard.id))}
                        </ul>
                      </li>
                    ))}
                    {add('New jobcard', () => actions.addJobcard(workpack.id))}
                  </ul>
                </li>
              );
            })}
            {add('New workpack', () => actions.addWorkpack())}
          </ul>
        </li>
      </ul>
      <p className="hint sidebar-hint">
        Click an item to edit it. Move the selected item with Alt+↑ / Alt+↓, delete it with Del.
      </p>
    </nav>
  );
}
