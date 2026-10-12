import { listContentTemplates } from '@jobcard/content-templates';

/** Placeholder start screen. Replace with the real editor (roadmap slice 1). */
export function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Jobcard Editor</h1>
      <p>Foundation build. Available content templates:</p>
      <ul>
        {listContentTemplates().map((t) => (
          <li key={t.id}>
            <strong>{t.name}</strong> – {t.description}
          </li>
        ))}
      </ul>
    </main>
  );
}
