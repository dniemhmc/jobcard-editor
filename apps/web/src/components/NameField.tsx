import { Text } from '@jobcard/domain';
import { useEffect, useRef, useState } from 'react';

interface Props {
  id: string;
  label: string;
  value: string;
  /** Called on every edit that is valid; invalid input is not saved. */
  onSave: (value: string) => void;
  /** Called on Enter, for quick entry of the next item. */
  onEnter?: () => void;
  /** Focus the field and select its text when it appears (new items). */
  autoFocus?: boolean;
  hint?: string;
  /** The field may be left empty; saving an empty value clears it. */
  optional?: boolean;
  /** Type of the input, for example "date" for a date picker. */
  type?: 'text' | 'date';
}

/**
 * A name or title, saved as you type. Render it with `key` set to the record id
 * so the field starts over when another record is selected.
 */
export function NameField({
  id,
  label,
  value,
  onSave,
  onEnter,
  autoFocus,
  hint,
  optional,
  type = 'text',
}: Props) {
  const [draft, setDraft] = useState(value);
  const input = useRef<HTMLInputElement>(null);
  const isValid = (text: string) =>
    Text.safeParse(text).success || (optional === true && text.trim() === '');
  const valid = isValid(draft);

  useEffect(() => {
    if (!autoFocus) return;
    input.current?.focus();
    input.current?.select();
  }, [autoFocus]);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        ref={input}
        id={id}
        type={type}
        className="input"
        value={draft}
        aria-invalid={!valid}
        aria-describedby={`${id}-help`}
        onChange={(e) => {
          setDraft(e.target.value);
          if (isValid(e.target.value)) onSave(e.target.value);
        }}
        onBlur={() => {
          if (!valid) setDraft(value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && valid && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
      />
      <span id={`${id}-help`} className={valid ? 'hint' : 'field-error'}>
        {valid ? hint : `${label} cannot be empty. The last saved value is kept.`}
      </span>
    </div>
  );
}
