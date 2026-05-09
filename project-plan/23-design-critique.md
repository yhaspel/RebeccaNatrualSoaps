# 23 — Design Critique

A design pass informed by the `/design:design-critique` skill. Scope: the full public site + admin panel in both English (LTR) and Hebrew (RTL).

## Critique axes
Hierarchy, consistency, rhythm & whitespace, colour, typography, imagery, microinteractions, bilingualism.

## Strengths

**Palette and mood.** Cream / ivory backgrounds against sage primary and warm clay accents create a quiet, hand-made feel that reads as artisanal without tipping into "rustic kitsch". The single accent colour (clay) is reserved for stock-warning states and the featured-product badge — scarcity keeps it legible. Ink (near-black with warmth) as the text colour is kinder to eyes than pure `#000` and reinforces the "natural" story.

**Typography pairing.** Fraunces as the display serif carries the brand voice (quirky, slightly rustic, humane) while Inter keeps body copy crisp and scannable. When the language flips to Hebrew, we swap display to Heebo, which sits at a similar stroke weight to Fraunces and preserves the visual rhythm. The `:lang(he)` CSS rule ensures the swap is automatic.

**Hierarchy.** The home page follows a traditional editorial rhythm: hero title → CTA → four-category grid → featured products → story → testimonials → newsletter. Each section has a clear anchor headline in Fraunces, a secondary sub-headline, and a single primary action. Nothing competes for the user's eye at the same level.

**Rhythm and whitespace.** Sections alternate between `bg-cream` and `bg-ivory` to signal new "chapters" without needing dividers. Max-width of 6xl (~72 rem) prevents line lengths from getting unreadable on wide screens. Consistent `py-16` / `py-12` section padding gives the design breathing room.

**Consistency.** Cards use a consistent `rounded-soft` (14 px) radius, `shadow-soft` elevation, and `bg-ivory` / `bg-cream` surfaces. Buttons share two shapes (pill for primary CTA, pill-outlined for secondary) and one interaction pattern (hover bg darken + focus ring). Tabs, toggle, and language switch all share the pill shape, which creates a family.

**Bilingual fidelity.** Tailwind `rtl:` variants + CSS logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) mean the layout mirrors without bespoke rules. Tested mentally against the hero, cart summary sidebar, and checkout form — everything reads naturally in both directions. The language toggle pill shows the target language in that language (`עברית` when in English, `English` when in Hebrew) — a small thing that makes the switch feel deliberate.

## Findings and recommendations

### 1. Hero is placeholder-heavy
The right-hand "hero" is a gradient box with an 8xl emoji. It signals the design intent but won't carry a real launch. We need one of: (a) a single editorial photograph of Rebecca at the stovetop, or (b) a carousel of three product photos on wood, or (c) a hand-drawn illustration of a soap bar. Option (a) is strongest: the brand is "one-woman workshop" — put the woman in the workshop.
Severity: launch blocker.

### 2. Featured and category cards both use square crops on cream — they collapse into a single "grid" visually
Between the "Find your bar" category grid and "This week's favourites" product grid, the user sees sixteen near-identical cards on near-identical backgrounds. The only cue distinguishing them is the label. Recommend differentiating the category cards: slightly larger cards, a subtle coloured circle behind the emoji (use the tallow/olive/vegan/specials sub-palette), and a one-line description in a lighter weight. The product cards should stay minimal.
Severity: medium.

### 3. Testimonial cards are indistinguishable from product cards
Same rounded-soft / shadow-soft / cream surface. Add a quiet differentiator: a serif open-quote glyph in sage at the top-left, or italicise the quote via Fraunces italic. This reclaims visual hierarchy between "product" and "social proof".
Severity: low.

### 4. CTA colour on sage
As noted in the accessibility review, ivory-on-sage is under the 4.5:1 threshold for body text. The design fix is to darken sage to `#6F8063`. Side effect: the secondary pill outlines (sage-30%) still look correct because they'll inherit the same hue at low alpha.
Severity: launch blocker (shared with accessibility).

### 5. Admin UI density
The admin product table is pleasant but the action column only has two hyperlink-style actions (Edit / Delete). In Hebrew the column label "פעולות" is short; in English "Actions" is short. Consider replacing the text hyperlinks with icon buttons once we introduce a real icon set — but keep text for MVP, accessibility is simpler.
Severity: low.

### 6. Newsletter section feels unfinished
Copy is good, but the layout looks adrift — a lone centred form on a full-width section. Adding a decorative element above the heading (a small hand-drawn sage sprig, or a `✦` divider in clay) would anchor the section and echo the "small story" language.
Severity: low.

### 7. About page has a fake image placeholder
Same launch-blocker note as #1. We need one real photograph here — ideally the "borrowed pot" moment referenced in the home story.
Severity: launch blocker.

### 8. Empty-state voice
Current empty-state copy says "Nothing here yet — check back soon." That reads like a placeholder. The brand voice can do better: "This shelf is curing. New bars in a week." Same for "Your cart is empty" — something like "Nothing in your basket yet. Start with a featured bar?" with an inline link to featured products.
Severity: low; UX copy polish.

### 9. Cart summary card position in RTL
The summary sidebar uses a grid `md:grid-cols-[1fr,20rem]` which places summary on the right in LTR and on the left in RTL — correct behaviour for Hebrew readers, and it looks natural mentally. Verified.

### 10. Mobile layout
The hero stacks well on mobile; the category grid drops to 2×2 which works. One concern: on very small screens (<360 px) the header has five elements (logo, language toggle, account, cart, hamburger). That will wrap. Recommend collapsing "account" into the hamburger at `sm` and below. The `hidden sm:inline-block` classes mean this already happens.

### 11. Focus ring on sage CTA
The `focus-visible:outline-ink` on sage-background buttons gives a strong dark ring — visible, clear. Good. On ivory-background buttons, `outline-sage` is the pattern — slightly less prominent against the off-white. Fine for now, revisit if user testing flags it.

### 12. Checkout form density
Three fieldsets stacked vertically with a sidebar summary. Works. The payment fieldset redirects to the Grow (Meshulam) hosted payment page for live payments. MVP mock is fine as three separate inputs.

### 13. Admin login doesn't show the brand
Admin login lives inside the admin shell which only shows "Store admin" in the top-left. Consider a softer, more personal landing — "Welcome back, Rebecca." (already in the subtitle) with a small sage sprig, so the experience mirrors the warmth of the public site.
Severity: low.

## Prioritised follow-ups

**Launch blockers**:

1. Real photography for hero, about, and key product shots (findings #1, #7).
2. Darken sage so primary buttons meet AA contrast (finding #4).

**Polish before launch**:

3. Differentiate category vs product cards (finding #2).
4. Treat testimonial cards distinctly (finding #3).
5. Revise empty-state copy (finding #8).

**Nice-to-have**:

6. Decorative hand-drawn accents on newsletter + admin login (findings #6, #13).
7. Revisit admin table actions with icon set (finding #5).

## Sign-off

The MVP reads as a thoughtful, quiet, handcrafted brand. Structure, typography, and rhythm are working. The two blockers are photography and the sage contrast tweak; the rest is polish that should land in the first post-launch cycle.
