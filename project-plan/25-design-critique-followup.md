# 25 — Design Critique (Pass 2)

A second design pass over the live frontend at `localhost:4200`, building on `23-design-critique.md` and `22-accessibility-review.md`. Scope: public shop + admin, EN/HE, refinement stage. The intent is to (a) confirm what's still unfixed from pass 1, (b) surface findings the first pass missed, and (c) capture issues that only appear under the live build.

## Status check on pass 1

The design system in `11-design-system.md` is in good shape on paper, but several pass-1 findings have not yet landed in code.

Still unfixed:

- Sage `#8A9A7B` is still the primary fill on every CTA (`home.component.ts`, `header.component.ts`, `cart.component.ts`, `checkout.component.ts`, `product-detail.component.ts`). The `sage.dark = #6B7D5C` token exists in `tailwind.config.js` but isn't applied to any button background. Contrast on `bg-sage / text-ivory` is still 3.4:1 — fails AA for normal text.
- Hero on `home.component.ts:38` is still the 8xl `🧼` in a gradient panel. `about.component.ts` likely the same.
- Mobile hamburger is still `h-8 w-8` (32 px); language toggle is still `px-3 py-1.5` (~28 px tall). Both under the 44 px guidance.
- Newsletter email label is still `sr-only` (`home.component.ts:177`).
- Empty-state copy still reads "Nothing here yet — check back soon." (`en.json:76`) and "Your cart is empty." (`en.json:93`). Brand voice has not landed in the empty-state strings.

These remain the launch blockers from pass 1. The fixes are well-scoped and small (one token, one image asset per page, two padding bumps, two copy lines) — worth knocking out together rather than piecemeal.

## Live-site findings (only visible at runtime)

These were not visible from the static code pass and showed up the moment the app booted.

### A. Two broken Transloco interpolations are reaching production copy

- **Footer copyright** renders literally as `© {year} Rebecca's Natural Soaps` on every page, in both languages. The template passes `{ year: year }` to `transloco`, but the `en.json` / `he.json` placeholder syntax must not match. This is the first thing a visitor reads at the bottom of every page.
- **Cart shipping note** renders as `Free shipping over {amount}`, again in both languages. Same kind of issue.

Both are blocker-level for "looks finished".

Severity: 🔴 launch blocker (copy correctness).

### B. About half the product images are broken

On `/products`, the cards for *Trio Gift Set*, *Honey & Tallow Bar*, *Try-It Sampler*, *Seasonal: Orange & Clove*, *Activated Charcoal Bar*, and *Oatmeal & Almond Milk* render as empty `bg-sage/10` rectangles with the alt text bleeding through in 11 px gray. The cards that do have working URLs (Coconut & Shea Butter, Lavender Fields Olive Soap) look genuinely lovely — they prove the design works when the data lands.

The fallback on `home.component.ts:108` and `products.component.ts:94` only fires when `image_url` is falsy. When the URL is set but the image 404s, the browser shows a broken-image affordance plus alt text, which is what we're seeing. Two fixes:

- Seed with placeholder images that resolve (a single neutral SVG is fine), or
- Add an `(error)="onImageError($event)"` handler that swaps to the emoji fallback when the asset 404s.

The second one is more resilient long-term.

Severity: 🔴 launch blocker — the empty cards make the page look unfinished.

### C. Hebrew breadcrumb still shows the English product name

Visited `/products/2` in Hebrew. The H1 reads `סבון חלב אקליפטוס`, but the breadcrumb above it reads `חנות / Eucalyptus Tallow Bar`. This confirms finding #5 from static analysis — the fix is to swap `name_en` for `trField: 'name'` in `product-detail.component.ts:39`.

### D. Hebrew checkout shows `+1` instead of `×1` for line-item quantity

`checkout.component.ts:174` — `<span class="text-ink/50">×{{ line.quantity }}</span>` — but on the rendered Hebrew page this comes through as `+1` next to the product name. (RTL flips the visual order of `×` glyphs adjacent to digits with some fonts and the multiplication sign isn't rendering at all in the chosen Hebrew face — it's reading as a plus.) Replace the multiplication sign with the actual digit-first form `(1×)` or wrap it as `&times;{{ line.quantity }}` inside an explicitly LTR span: `<span dir="ltr">×{{ line.quantity }}</span>`.

Severity: 🟡 moderate (i18n/typography bug).

### E. Currency formatting is `₪ NN` rather than the Israeli `NN ₪` convention

Across cart, checkout, and product cards the shekel sign is rendered before the amount with a space (e.g. `₪ 36`). In Hebrew commerce the suffix form `36 ₪` is more common and reads more naturally for Israeli buyers. Audit `formatMoney()` in `core/utils/money.ts` for the active locale.

Severity: 🟢 minor (locale convention).

### F. Many pages are vertically sparse on desktop

Cart, product detail, and login content are dense at the top and leave 60-70% of the viewport empty below them on a 1440-tall display. This isn't a bug, but it makes the shop feel unfinished compared to the home page, which has rhythm down the scroll. Two cheap moves:

- Add a "You might also like" 4-card row to the product detail page (already in `en.json:83` as `productDetail.relatedTitle` — wired up but not rendered).
- Add a "Continue shopping →" anchor under the cart summary that links back to `/products`.

These reduce the visual gulf between "loaded but empty" and "full".

Severity: 🟢 minor (perceived completeness).

### G. About-page placeholder is a sparkle emoji on a gradient

`/about` shows a single `✨` glyph centred in a sage→ivory gradient panel where Rebecca's portrait should be. Same launch blocker as pass 1 finding #7 — confirmed unfixed.

## New findings (from static analysis)

### 1. `RnsButton` is documented but never used

`11-design-system.md` lists `RnsButton — variants primary | ghost | link, sizes sm | md | lg`. Every component renders buttons inline (`class="... rounded-full bg-sage px-6 py-3 ..."`). The primitive doesn't exist in `shared/ui/`. The result is that button sizing, hover, focus, and disabled states are **redefined per-component**, which is exactly the problem a primitive solves.

Concretely, the same "primary CTA" appears with `py-1.5`, `py-2`, `py-2.5`, and `py-3` across the app. The two small ones fail the touch-target guidance; the variation isn't a deliberate hierarchy choice.

Why this matters: a contrast or hover fix has to land in 7+ files and stay synchronized.

How to apply: build `rns-button` in `shared/ui/`, expose `variant` (`primary | secondary | ghost | link`) and `size` (`sm | md | lg`), and migrate header → home → product-detail → cart → checkout → admin in that order. Even a quick pass fixes the contrast issue once.

Severity: 🔴 the source of most of the consistency drift below.

### 2. Contrast failures extend beyond the sage button

Pass 1 caught `bg-sage / text-ivory` on primary buttons. The same color used as **inline text** on cream/ivory hits the same wall.

| Where | Color combo | Ratio | Notes |
|---|---|---|---|
| Featured "View all →" link (`home.component.ts:85`) | `text-sage` on `bg-ivory` | ≈2.7:1 | Fails AA for normal body text |
| "Read the whole story →" (`home.component.ts:131`) | `text-sage` on cream | ≈2.7:1 | Same |
| Active product-tab state (`products.component.ts:43–44`) | `text-ivory` on `bg-sage` | ≈3.4:1 | Same root cause as the button |
| Stock warning "Only N left" (`product-detail.component.ts:88`, `products.component.ts:106`) | `text-clay` on cream/ivory | ≈2.6:1 | Clay reads as decorative, not as legible text |
| Featured badge in admin (`admin-products.component.ts:89`) | `text-clay` on `bg-clay/20` | borderline | Acceptable here — it's a small badge, not body text |

Recommendation: darkening sage to `#6F8063` (or moving everywhere to the existing `sage.dark = #6B7D5C` — already there, even better) fixes the inline-link case the same way it fixes the button case. For clay text, introduce `clay.dark = #9A6943` and reserve plain `clay` for backgrounds and badges.

Severity: 🔴 blocker — extends pass 1's contrast finding.

### 3. Off-palette red on the admin delete button

`admin-products.component.ts:121`: `class="text-red-700 ..."`. There is no `red` token in `tailwind.config.js`, so this falls through to default Tailwind red. It clashes against the cream/sage/clay palette — sticks out as the only saturated red in the whole product. Two options:

- Tone the destructive action down: keep the same hyperlink style as Edit (`text-sage` → fixed-contrast variant), but pair it with a clearer confirmation modal (already a follow-up from pass 1, finding #6).
- Add a `danger` token to the palette — e.g. `#A14B3D` (a deep terracotta that lives in the same warm family as clay), and use it sparingly for destructive actions and error alerts.

Option 2 keeps the brand cohesion. Either way, drop `text-red-700`.

Severity: 🟡 moderate.

### 4. Hover state on primary buttons is too subtle

Every primary CTA uses `hover:bg-sage/90`. That's a 10% alpha shift over the same hue — barely perceptible on cream. The design tokens already define `sage.dark` for exactly this purpose; switch hover to `hover:bg-sage-dark`. Bonus: this also makes the active/pressed state (`active:bg-sage-dark`) feel like a real state change rather than a fade.

Severity: 🟡 moderate.

### 5. Breadcrumb on product detail shows the English name in Hebrew

`product-detail.component.ts:39`:

```html
<span>{{ product()?.name_en || '' }}</span>
```

Hardcoded to `name_en`. In a Hebrew session, the breadcrumb crumb stays in English while the rest of the page is Hebrew. Replace with `{{ product() | trField: 'name' }}` — the same pattern used everywhere else.

Severity: 🟡 moderate (i18n correctness).

### 6. Default shipping country is a literal English string

`checkout.component.ts:236`: `shipping_country: ['Israel']`. In a Hebrew session this is Latin text inside an RTL form field. Either:

- Localize the default via `transloco.translate('checkout.countryDefault')`, with `ישראל` in `he.json`, or
- Replace the free-text country input with a single read-only `Israel / ישראל` row, since the shop only ships to Israel anyway.

Severity: 🟡 moderate (i18n correctness).

### 7. Native number spinners look inconsistent across browsers

`product-detail.component.ts:101–108` and `cart.component.ts:71–78` use `<input type="number">`. Chrome shows vertical step buttons on hover; Firefox shows them always; Safari shows none. None match the soft-pill aesthetic of the rest of the app.

Two safe options:

- Hide the spinner with CSS (`appearance: none`, `::-webkit-inner-spin-button { display:none }`), keeping the input itself.
- Build a small `+ / − / value` group out of `RnsButton` (once it exists) — better for touch and keyboard, and removes the OS-specific UI.

Severity: 🟢 minor (visual/UX consistency).

### 8. OS-dependent emoji rendering

`🧺` in the cart button, `🧼` everywhere as the placeholder, `🐄 🫒 🌿 ✨` in the home category circles, and the trailing `→` arrows. Apple emoji are warm and rounded, Windows emoji are flat and saturated, Linux emoji are often missing. The brand voice is artisanal — mismatched emoji glyphs across platforms break it.

Recommendation: replace all decorative emoji with inline 16–20 px SVG icons in `currentColor`. The category circles in particular would benefit from hand-drawn-style line icons (a tallow drop, an olive sprig, a leaf, a sparkle). Keep emoji only inside customer-supplied content (testimonials, etc.) where it's their voice not yours.

Severity: 🟡 moderate — directly affects perceived quality.

### 9. Newsletter form silently submits to nothing

`home.component.ts:175` has `(submit)="$event.preventDefault()"`. The disclosure ("We'll hook this up after launch.") sits below the form in `text-xs`, which most users will skim past. A user who fills in their email gets a button that does… nothing, then sees a small caption afterwards.

Either:

- Disable the submit button and add a banner above the form ("Coming soon — drop your email below and we'll add you when it's live"), with the input wired to a placeholder POST that just stores it locally for now, or
- Hide the form entirely until the integration is real, and replace it with a single contact-page link.

Severity: 🟡 moderate (trust and tone).

### 10. Header brand is text-only

`header.component.ts:17–20` is two stacked text spans. For a hand-made brand, even a small mark — a sage sprig, a soap-bar silhouette, Rebecca's initials in Fraunces italic — would give the identity something to hang on to in browser tabs and on mobile when the tagline gets cut off. Pair this with finding #8 (custom SVG icon set) and you get a coherent visual system.

Severity: 🟢 minor — but high payoff for brand recognition.

### 11. Disabled state on primary buttons is unclear

`disabled:opacity-50` (`product-detail.component.ts:113`, `checkout.component.ts:204`) drops the whole button to 50% alpha — including the text. On a sage button this becomes a low-contrast wash of green-on-cream that reads as "loading", not "disabled". Native disabled controls are exempt from WCAG contrast, but the *meaning* of the state should still be obvious.

Replace with an explicit disabled treatment: `disabled:bg-sage/30 disabled:text-ink/40 disabled:cursor-not-allowed`. Once `RnsButton` exists, encode this in the primitive.

Severity: 🟢 minor.

### 12. Hero gradient placeholder bands on light mode displays

`bg-gradient-to-br from-sage/30 via-ivory to-clay/20` on the hero panel introduces visible banding on lower-bit-depth displays (a lot of laptops). Solid `bg-sage/10` reads as the same warmth and doesn't band. Becomes moot once a real photograph lands (pass 1 finding #1) — but worth flipping in the meantime so MVP screenshots look clean.

Severity: 🟢 minor.

## Prioritised follow-ups

**Launch blockers (do these first):**

1. Fix the two broken Transloco interpolations: footer `{year}` and cart `{amount}`. (Live finding A.)
2. Resolve missing product images — either seed working URLs or add an `(error)` fallback to the emoji placeholder. (Live finding B.)
3. Real photography for hero (home), about, and remaining product shots. (Pass 1 #1, #7.)
4. Apply `sage.dark` (`#6B7D5C`) — or darken the base `sage` token — to fix contrast across primary buttons, active tab state, and inline `text-sage` links. (Pass 1 #4 + new #2.)
5. Bump hamburger and language-toggle hit areas to `h-11 / py-2.5`. (Pass 1 a11y #1.)
6. Promote the newsletter label to visible; decide whether to disable the form until it's wired up. (Pass 1 a11y #3 + new #9.)
7. Rewrite empty-state strings in brand voice. (Pass 1 #8.)

**Ship-quality bugs (do before launch):**

8. Build `RnsButton` and migrate every CTA through it. Prerequisite for the contrast, hover, and disabled-state fixes landing cleanly across the app.
9. Fix the breadcrumb to use `trField: 'name'` — confirmed mixed-language in Hebrew. (Live finding C.)
10. Replace `+1`-rendering quantity prefix in checkout with an LTR-safe `×N`. (Live finding D.)
11. Localize default shipping country (`Israel` → `ישראל` in HE). (Static #6.)
12. Replace `text-red-700` in admin delete with a brand-aligned destructive treatment.

**Polish:**

13. Replace decorative emoji with an inline SVG icon set (start with cart, hamburger, category circles, breadcrumb separator).
14. Custom number-input controls or `appearance: none` on the native ones.
15. Brand mark in the header.
16. Solid hero panel until photography lands.
17. Audit `formatMoney()` so Hebrew rendering uses the `36 ₪` suffix convention. (Live finding E.)
18. Add a "you might also like" row on product detail; add "continue shopping" link under the cart summary. (Live finding F.)

## Sign-off

Same overall read as pass 1: the system is sound, the rhythm and typography are working, and the gap between the documented design system and what shipped is the single biggest source of drift. Building `RnsButton` and cycling through the contrast/hit-target fixes underneath that primitive collapses about half the open findings from both passes into one focused piece of work.
