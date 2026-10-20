import { DISCIPLINES, DISCIPLINE_STYLES, type Discipline } from '@jobcard/domain';

interface Props {
  id: string;
  value: readonly Discipline[];
  onChange: (disciplines: Discipline[]) => void;
}

/**
 * The disciplines needed for an activity, chosen from the predefined list. The
 * bar on top shows how the header of the activity sheet will look.
 */
export function DisciplineField({ id, value, onChange }: Props) {
  const toggle = (d: Discipline) =>
    onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d]);
  const chosen = DISCIPLINES.filter((d) => value.includes(d));

  return (
    <fieldset className="field discipline-field" aria-describedby={`${id}-help`}>
      <legend>Discipline</legend>
      <div className="discipline-preview" aria-hidden="true">
        {chosen.length === 0 ? (
          <span className="discipline-segment discipline-none">None chosen</span>
        ) : (
          chosen.map((d) => (
            <span
              key={d}
              className="discipline-segment"
              style={{
                background: DISCIPLINE_STYLES[d].background,
                color: DISCIPLINE_STYLES[d].text,
              }}
            >
              {d}
            </span>
          ))
        )}
      </div>
      <div className="discipline-options">
        {DISCIPLINES.map((d) => (
          <label key={d} className="discipline-option">
            <input type="checkbox" checked={value.includes(d)} onChange={() => toggle(d)} />
            <span
              className="discipline-swatch"
              style={{ background: DISCIPLINE_STYLES[d].background }}
            />
            {d}
          </label>
        ))}
      </div>
      <span id={`${id}-help`} className="hint">
        Pick every discipline needed. They are printed as the header bar of the activity sheet.
      </span>
    </fieldset>
  );
}
