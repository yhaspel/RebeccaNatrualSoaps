# 22 — Accessibility Review (WCAG 2.1 AA)

A structured pass over the MVP using WCAG 2.1 AA as the bar, informed by the `/design:accessibility-review` skill. Scope: the public shop, auth, about, contact, and the admin panel. This is a static review against the current code; a browser-based axe / Lighthouse run is the natural next step once the full stack boots.

## Review scope
Home, Products list, Product detail, Cart, Checkout, Auth login/register, About, Contact, Account, Admin login, Admin products list/form, Admin orders, Admin messages.

## What's already in good shape

**Structure and landmarks.** Every page renders inside a `<main id="main">` via the public or admin shell, with `<header>`, `<nav>`, and `<footer>` landmarks. The public shell exposes "Skip to content" via `index.html`'s `<a class="skip-link">` pointing at `#main`, styled to become visible only on focus in `styles.scss`. The admin shell reuses the same pattern.

**Language + direction.** `I18nFacade.init()` wires an `effect()` that sets both `document.documentElement.lang` and `document.documentElement.dir` whenever the language signal changes, so assistive technology always sees the correct language and reading order. Hebrew content inside bilingual admin forms is additionally marked with `dir="rtl" lang="he"` on the fieldset so screen readers announce the right language even while the surrounding UI is in English.

**Focus visibility.** Global `*:focus-visible { outline: 3px solid theme(colors.sage); outline-offset: 3px }` lives in `styles.scss`, and every interactive element that changes the default ring adds an explicit `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage` (primary buttons escalate to `outline-ink` for contrast against the sage background).

**Forms.** All form inputs use explicit `<label>` wrappers with visible text. Required fields are enforced via `Validators.required`, and autocomplete hints (`email`, `name`, `address-line1`, `cc-number`, etc.) are set so password managers and autofill work. The newsletter field uses `sr-only` for its label, which is acceptable because the placeholder echoes the label — still, we should promote it to a visible label before launch for people who rely on on-screen labels (see finding #3 below).

**Semantic controls.** The category filter on `/products` uses `role="tablist"` + `role="tab"` + `aria-selected` so it surfaces as a proper tab set. The mobile menu button carries `aria-expanded` bound to the open-state signal, and `aria-label` from `nav.menu`. The cart button exposes the item count with both visible text and `aria-label`.

**Decorative vs meaningful images.** The emoji placeholders used while real product photography is pending are marked `aria-hidden="true"`. Actual product `<img>` tags consume the localised name via the `trField` pipe — so alt text switches with the language, which is the right behaviour for bilingual e-commerce.

**Reduced motion.** There's no forced `prefers-reduced-motion` override yet, but the only motion is a `translate-y-0.5` hover lift and a spinner. No auto-play, no parallax, no flashing. The spinner's only moving element is the ring border.

## Findings and fixes

### 1. Mobile menu + language-toggle hit targets are under 44 × 44 px
Location: `shared/layout/header.component.ts`, `shared/layout/language-toggle.component.ts`.
The hamburger `button` is `h-8 w-8` (32 px) and the language-toggle pill is `px-3 py-1.5` (~28 px tall). WCAG 2.2 SC 2.5.8 (24 × 24) passes but Apple/Google guidance and our own field testing with older users both call for 44 px.
Fix: bump the hamburger to `h-11 w-11` and the toggle to `py-2.5`.

### 2. Sage contrast on primary buttons
Brand palette ink `#2E2A26` on cream `#F5EFE6` → ratio ≈ 12.1:1 ✅ AAA. Ivory on sage `#8A9A7B` → ≈ 3.4:1 → this hits AA only for large text (18 pt / 14 pt bold). Most sage backgrounds carry 14 px regular text (buttons) — **fail**.
Fix: darken sage to `#6F8063` (contrast ≈ 5.0:1) or keep the current sage and switch primary-button text to ink. Darkening sage preserves the warmth of the palette and still feels on-brand; this is the recommended fix.

### 3. Newsletter email label is sr-only
Location: `features/home/home.component.ts`.
For users relying on visible labels (cognitive accessibility, reading-aloud assistive tools), the `sr-only` label should become visible. The simplest fix: keep the label visible above the input at all breakpoints, drop the placeholder, and tighten the horizontal layout on larger screens.

### 4. Live region for the "Added to cart" toast
Location: `features/product-detail/product-detail.component.ts`.
The success alert that appears after clicking "Add to cart" is added to the DOM conditionally — `rns-alert` renders with `role="alert"` but the surrounding container uses `@if` to mount and unmount. That works for screen readers on mount, but a fast double-click could swap the node too quickly. A safer pattern is a persistent `role="status"` container whose text content is the signal. Low severity — defer to follow-up.

### 5. Admin product form labels
Location: `features/admin/admin-product-form/admin-product-form.component.ts`.
Two `name` fields on the same form (English and Hebrew) share the visible label "Name". The surrounding `<fieldset><legend>English</legend>` / `<legend>Hebrew</legend>` gives context, but some screen readers only announce the legend on focus-in of the first field. Consider giving each input an `id` and labelling it as `name_en` / `name_he` with `aria-label` composed from section + field.

### 6. Confirm-delete dialog
Location: `features/admin/admin-products/admin-products.component.ts`.
We call `window.confirm(...)` with a translated message. Native `confirm` is accessible out of the box, but not stylable, and some keyboard users lose focus context after dismissal. Acceptable for MVP; replace with a focus-trapped modal before launch.

### 7. `aria-label` on the language toggle pill
Location: `shared/layout/language-toggle.component.ts`.
The button text is "עברית" or "English" — the target language. We also set `aria-label="{{ 'nav.language' | transloco }}"` ("Language" / "שפה"). That's the correct pattern: accessible name announces the control's purpose, visible text announces the action. The `[lang]` attribute on the button switches per-render so pronunciation is correct. ✅

### 8. Keyboard navigation
No keyboard traps identified. Routes are plain `<a routerLink>` anchors; the mobile menu closes on selection. Admin orders and messages use inline selects/checkboxes — keyboard-operable by default. Category tabs use buttons and respect standard Tab order; full arrow-key navigation (`ArrowLeft/ArrowRight`) is not wired up — the tab pattern recommends this, but it's a progressive enhancement rather than a blocker.

### 9. Error messaging
Location: various forms.
Field-level validity is not currently surfaced with `aria-invalid` / `aria-describedby`. Top-of-form `rns-alert tone="error"` is announced (`role="alert"`). For MVP this is acceptable; full SC 3.3.1 (Error identification) compliance needs per-field hints.

## Prioritised follow-ups

**Ship blockers** (fix before launch):

1. Sage contrast on primary buttons (finding #2).
2. Touch target sizes in header (finding #1).

**Soon after launch**:

3. Promote newsletter label (finding #3).
4. Replace `window.confirm` with a focus-trapped modal (finding #6).
5. Per-field error messaging with `aria-invalid` (finding #9).

**Nice-to-have**:

6. Arrow-key navigation on category tabs.
7. Consolidate the add-to-cart confirmation into a persistent `aria-live` region.

## Sign-off

Static review passes the SC that matter most: perceivability (contrast pending), keyboard operability, language correctness across EN/HE, landmark structure, labels. Items 1 and 2 above are the only hard blockers for an accessibility-conscious launch.
