# Style note

The look of the editor app (`apps/web`). The first app setup turns this into shared theme
settings (CSS custom properties) once, and every screen uses those instead of its own colours or
sizes. The wireframes in `docs/wireframes` stay deliberately sketchy and record structure only;
the PDF (`packages/pdf`) keeps its own print styling.

## Principles

- **Simple and calm, white and greys.** White panels on a light grey background, neutral greys
  for text, borders and selection, thin borders, little decoration. No colour accent: primary
  actions and focus use dark grey. Red is only used for destructive actions and validation
  errors. Fancier UI (animation, illustrations, rich layouts) comes later. No company brand
  colours.
- **Compact.** Authors work through many activities, so screens show a lot at once, closer to a
  desktop business tool than a roomy web form.
- **Content first.** The jobcard data is the product; chrome stays quiet.

## Colours

| Token            | Value     | Use                                      |
| ---------------- | --------- | ---------------------------------------- |
| `--bg`           | `#f7f7f7` | App background (light grey)              |
| `--surface`      | `#ffffff` | Panels, cards, inputs                    |
| `--surface-alt`  | `#f0f0f0` | Sidebar, table headers, hover            |
| `--border`       | `#dddddd` | Panel and input borders, dividers        |
| `--text`         | `#1a1a1a` | Body text                                |
| `--text-muted`   | `#5f5f5f` | Labels, hints, secondary text            |
| `--text-faint`   | `#9e9e9e` | Placeholders, disabled (not for content) |
| `--accent`       | `#333333` | Primary buttons, links, focus, selection |
| `--accent-hover` | `#111111` | Hover / pressed accent                   |
| `--accent-soft`  | `#e0e0e0` | Selected row or item background          |
| `--danger`       | `#c62828` | Destructive actions, validation errors   |
| `--warning`      | `#5f5f5f` | Warnings (grey, always with text)        |
| `--success`      | `#5f5f5f` | Saved, valid (grey, always with text)    |

Body text, muted text, the accent and white text on the accent meet WCAG AA contrast on
`--surface` and `--bg`. Status is never shown by colour alone; pair it with text or an icon.

Dark mode: not planned for now.

## Typography

- **Font:** [Inter](https://rsms.me/inter/), self-hosted with the app (no external font CDN),
  falling back to `system-ui, 'Segoe UI', Arial, sans-serif`. The PDF keeps Arial.
- **Sizes:** base 13px; small (labels, hints) 12px; headings 15px / 18px / 22px. Line height 1.4.
- **Weights:** 400 regular, 500 for labels and buttons, 600 for headings.
- Numbers in tables use tabular figures (`font-variant-numeric: tabular-nums`).

## Density and spacing

- **Spacing scale:** 4px base: 4, 8, 12, 16, 24, 32.
- **Controls:** inputs and buttons 28px high; table rows 32px.
- **Forms:** label above the field, 8px gap between fields, 16px between groups.
- **Radius:** 4px for inputs, buttons and panels. **Shadows:** none, except a subtle one on menus
  and dialogs.
- Layout follows the wireframes: top bar, sidebar, main area. The main area is white and the
  details form sits directly on it (no panel box), at most 640px wide.

## Components (to start)

- **Buttons:** one primary (accent fill) per view; secondary is white with a border; destructive
  uses `--danger`.
- **Inputs:** white, 1px `--border`, 2px accent focus ring.
- **Tables / lists:** for activities and child items; hover `--surface-alt`, selected
  `--accent-soft`.
- **Icons:** one outline icon set, 16px, in `--text-muted` unless active.

## Open

- Serif headings are left out for now to keep one font.
