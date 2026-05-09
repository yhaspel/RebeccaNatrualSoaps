# 13 — Home Page

## Sections (top → bottom)
1. **Hero** — full-width image, serif headline ("Small batch. Big care."),
   supporting sentence, primary CTA → `/products`.
2. **Category tiles** — 4 large cards (Tallow, Olive Oil, Vegan, Specials) with
   a soft tinted overlay; each links to `/products?category=<slug>`.
3. **Featured soaps** — `catalogFacade.featured()` horizontal row; each card
   links into the detail page.
4. **Story teaser** — two-column block: photograph + 3-paragraph excerpt
   from the About copy, with a link through to the full story.
5. **Testimonials** (static, translated) — three small cards.
6. **Newsletter CTA** (non-functional in MVP — the form acknowledges but doesn't
   POST anywhere; a `TODO(newsletter)` comment notes the follow-up).

All copy keyed into `home.*` in `en.json` / `he.json`.
