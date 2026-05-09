# 11 — Design System & Visual Tokens

## Inspiration
lilyrosenatural.com — soft cream background, muted sage and ochre accents,
generous whitespace, serif headings paired with a clean sans body.

## Palette
| Token            | Hex        | Use |
|------------------|------------|-----|
| `--rns-cream`    | `#F5EFE6`  | Page background |
| `--rns-ivory`    | `#FBF7F1`  | Card background |
| `--rns-sage`     | `#8A9A7B`  | Primary accent / buttons |
| `--rns-sage-dk`  | `#6B7D5C`  | Button hover / active |
| `--rns-clay`     | `#C58B5F`  | Secondary accent (sale tags) |
| `--rns-ink`      | `#2E2A26`  | Body text (contrast 12:1 on cream) |
| `--rns-ink-soft` | `#5B544C`  | Secondary text |
| `--rns-line`     | `#E4DDD0`  | Dividers, subtle borders |

## Typography
- Headings: **Fraunces** (Google Fonts, serif, optical size axis for wider glyphs).
- Body: **Inter** (Latin) / system **"Heebo"** (Hebrew).
- Hebrew fallback stack in `:lang(he)` swaps to Heebo for better vertical rhythm.

## Spacing + radii
- Tailwind defaults, plus custom radii: `rounded-soft = 0.875rem`.
- Section padding: `py-20 sm:py-28` for landing sections.

## Component primitives (`shared/ui/`)
- `RnsButton` — variants `primary | ghost | link`, sizes `sm | md | lg`.
- `RnsCard` — container with soft shadow and ivory background.
- `RnsInput` / `RnsTextarea` — label + error slot + RTL-aware.
- `RnsAlert` — `success | warn | error`, with icon.
- `RnsEmpty` — icon + message for empty states.
- `RnsSpinner` — accessible (role="status").

Every primitive takes translation keys for its content, never literals.
