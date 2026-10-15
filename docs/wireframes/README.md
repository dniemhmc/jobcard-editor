# Wireframes

Low-fidelity, greyscale wireframes for the editor UI. They are throwaway sketches to agree on
structure and flow before building in `apps/web`; they are **not** production code and are not
part of any package.

## Viewing

Static HTML, no build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080 --directory docs/wireframes
```

## Authoring

- Copy `_template.html`, name it `NN-short-name.html`, add a row to `index.html`.
- Use only the classes in `wireframe.css` (`.screen`, `.topbar`, `.sidebar`, `.main`, `.panel`,
  `.btn`, `.input`, `.card`, `.img`, `.note`, …). Extend the kit rather than inline styling.
- Each screen declares the requirement ids (`docs/requirements/README.md`) it covers.
- Use clearly fake placeholder text ("Sample step"). Do not invent offshore work instructions;
  see `CLAUDE.md`.
- Put open design questions in `.note` stickies; if they are domain questions, also add them to
  `docs/open-questions.md`.
- Wireframes must not contradict ADRs. If a sketch needs to, propose a new ADR.

## Screens

| #   | Screen                               | Requirements   | Phase |
| --- | ------------------------------------ | -------------- | ----- |
| 00  | Open project (on app start)          | R7             | 1     |
| 01  | Project details (project selected)   | R7             | 1     |
| 02  | Workpack details (workpack selected) | R7, R8         | 1, 2  |
| 03  | Jobcard details (jobcard selected)   | R1, R2, R3, N3 | 1     |
| 04  | Activity details (activity selected) | R1, R2, R3     | 1     |
