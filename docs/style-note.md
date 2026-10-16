# Style note

The look of the editor app (`apps/web`). The first app setup turns this into shared theme
settings (CSS custom properties) once, and every screen uses those instead of its own colours or
sizes. The wireframes in `docs/wireframes` stay deliberately sketchy and record structure only;
the PDF (`packages/pdf`) keeps its own print styling.

## Principles

- **Simple and calm, Claude-like.** The Claude chat interface is the reference: warm off-white
  background, warm greys, thin borders, one muted clay accent, little decoration. Take only that
  simple base; fancier UI (animation, illustrations, rich layouts) comes later. No company brand
  colours.
- **Compact.** Authors work through many activities, so screens show a lot at once, closer to a
  desktop business tool than a roomy web form.
- **Content first.** The jobcard data is the product; chrome stays quiet.

## Colours

| Token            | Value     | Use                                      |
| ---------------- | --------- | ---------------------------------------- |
| `--bg`           | `#faf9f7` | App background (warm off-white)          |
| `--surface`      | `#ffffff` | Panels, cards, inputs                    |
| `--surface-alt`  | `#f2f0eb` | Sidebar, table headers, hover            |
| `--border`       | `#e2ded6` | Panel and input borders, dividers        |
| `--text`         | `#1f1e1c` | Body text                                |
| `--text-muted`   | `#6b665e` | Labels, hints, secondary text            |
| `--text-faint`   | `#9a958c` | Placeholders, disabled (not for content) |
| `--accent`       | `#b4532f` | Primary buttons, links, focus, selection |
| `--accent-hover` | `#93432a` | Hover / pressed accent                   |
| `--accent-soft`  | `#f6ebe5` | Selected row or item background          |
| `--danger`       | `#c62828` | Destructive actions, validation errors   |
| `--warning`      | `#995c00` | Warnings                                 |
| `--success`      | `#2e7d32` | Saved, valid                             |

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
- Layout follows the wireframes: top bar, sidebar, main area.

## Components (to start)

- **Buttons:** one primary (accent fill) per view; secondary is white with a border; destructive
  uses `--danger`.
- **Inputs:** white, 1px `--border`, 2px accent focus ring.
- **Tables / lists:** for activities and child items; hover `--surface-alt`, selected
  `--accent-soft`.
- **Icons:** one outline icon set, 16px, in `--text-muted` unless active.

## Open

- Serif headings, as in the Claude interface, are left out for now to keep one font.
