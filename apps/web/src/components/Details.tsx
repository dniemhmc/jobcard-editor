import type { EditorActions } from '../editor-actions';
import { activityLabel, type Resolved } from '../selection';
import { NameField } from './NameField';

interface Props {
  resolved: Resolved;
  actions: EditorActions;
  /** Put the cursor in the name field (the item was just created). */
  focusName: boolean;
}

/** The details form of the selected item. */
export function Details({ resolved, actions, focusName }: Props) {
  const { project, workpack, jobcard, activity } = resolved;

  switch (resolved.selection.kind) {
    case 'project':
      return (
        <section className="details">
          <div className="details-header">
            <h2>Project</h2>
            <button type="button" className="btn btn-danger" onClick={actions.deleteProject}>
              Delete project
            </button>
          </div>
          <NameField
            key={project.id}
            id="project-name"
            label="Name"
            value={project.name}
            onSave={actions.renameProject}
            autoFocus={focusName}
          />
          <NameField
            key={`${project.id}-job-number`}
            id="project-job-number"
            label="Job number"
            value={project.jobNumber ?? ''}
            onSave={actions.setProjectJobNumber}
            optional
            hint="The supplier order number. Printed in the title block of every sheet."
          />
        </section>
      );
    case 'workpack':
      if (!workpack) return null;
      return (
        <section className="details">
          <div className="details-header">
            <h2>Workpack</h2>
          </div>
          <NameField
            key={workpack.id}
            id="workpack-title"
            label="Title"
            value={workpack.title}
            onSave={(title) => actions.renameWorkpack(workpack.id, title)}
            onEnter={() => actions.addJobcard(workpack.id)}
            autoFocus={focusName}
            hint="Press Enter to add a jobcard to this workpack."
          />
          <NameField
            key={`${workpack.id}-module`}
            id="workpack-module"
            label="Module"
            value={workpack.module ?? ''}
            onSave={(module) => actions.setWorkpackModule(workpack.id, module)}
            optional
            hint="The module of the platform. Printed in the title block of every sheet."
          />
        </section>
      );
    case 'jobcard':
      if (!jobcard) return null;
      return (
        <section className="details">
          <div className="details-header">
            <h2>Jobcard</h2>
          </div>
          <NameField
            key={jobcard.id}
            id="jobcard-title"
            label="Title"
            value={jobcard.title}
            onSave={(title) => actions.renameJobcard(jobcard.id, title)}
            onEnter={() => actions.addActivity(jobcard.id)}
            autoFocus={focusName}
            hint="Press Enter to add an activity. Activities are listed in the tree on the left."
          />
          <NameField
            key={`${jobcard.id}-jc-number`}
            id="jobcard-jc-number"
            label="JC number"
            value={jobcard.jcNumber ?? ''}
            onSave={(jcNumber) => actions.setJobcardNumber(jobcard.id, jcNumber)}
            optional
            hint="The jobcard number. Printed in the title block of every sheet."
          />
        </section>
      );
    case 'activity':
      if (!jobcard || !activity) return null;
      return (
        <section className="details">
          <div className="details-header">
            <h2>{activityLabel(jobcard, activity.id)}</h2>
          </div>
          <NameField
            key={activity.id}
            id="activity-name"
            label="Name"
            value={activity.name}
            onSave={(name) => actions.renameActivity(jobcard.id, activity.id, name)}
            onEnter={() => actions.addActivity(jobcard.id, activity.id)}
            autoFocus={focusName}
            hint="Press Enter to add the next activity."
          />
        </section>
      );
  }
}
