# Rebecca's Natural Soaps — Build Progress

Tracks the status of each step in `project-plan/`. Check boxes as steps complete.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

| #  | Step                                                  | Status | Notes |
|----|-------------------------------------------------------|:------:|-------|
| 01 | [Vision & architecture](./01-vision-and-architecture.md) | [x] | Complete |
| 02 | [Monorepo + tooling](./02-monorepo-and-tooling.md)    | [x] | Complete |
| 03 | [Backend foundation (Django + JWT)](./03-backend-foundation.md) | [x] | apps scaffolded, custom user, JWT views |
| 04 | [Data models (Category, Product, Order…)](./04-data-models.md) | [x] | catalog, orders, contact models |
| 05 | [Public + auth REST APIs](./05-rest-apis.md)          | [x] | All public + user endpoints |
| 06 | [Admin APIs](./06-admin-apis.md)                      | [x] | Admin viewsets wired |
| 07 | [Payments (Grow / Meshulam)](./07-payments.md)        | [x] | Grow wrapper with mock fallback |
| 08 | [Seed mock soap catalog](./08-seed-data.md)           | [x] | 12 soaps, 4 categories, admin user |
| 09 | [Angular scaffold + 3-layer arch](./09-frontend-scaffold.md) | [x] | Core / Abstraction / Features; standalone + signals |
| 10 | [i18n (EN/HE) + RTL](./10-i18n-and-rtl.md)            | [x] | Transloco + document dir sync + full EN + HE bundles |
| 11 | [Design system + tokens](./11-design-system.md)       | [x] | Cream/ivory/sage/clay palette, Fraunces+Inter+Heebo |
| 12 | [Shared layout (header, footer, nav)](./12-shared-layout.md) | [x] | Public + admin shells, mobile nav, cart badge, lang toggle |
| 13 | [Home page](./13-home-page.md)                        | [x] | Hero, categories, featured, story, testimonials, newsletter |
| 14 | [Products + category browsing](./14-products-page.md) | [x] | Tab-based category filter with query-param sync |
| 15 | [Product detail page](./15-product-detail.md)         | [x] | Image, price, stock, qty, add-to-cart, ingredients |
| 16 | [Shopping cart](./16-cart.md)                         | [x] | Signals-backed, localStorage, free-shipping threshold |
| 17 | [Checkout + credit card](./17-checkout.md)            | [x] | Mock-card form → server payment intent → confirm |
| 18 | [Auth pages + account](./18-auth-and-account.md)      | [x] | Login, register, /account with order history |
| 19 | [About Rebecca's page](./19-about-page.md)            | [x] | Story, ingredients, values, closing note |
| 20 | [Contact Us page](./20-contact-page.md)               | [x] | Throttled form with success / error / rate-limit states |
| 21 | [Admin panel at /admin](./21-admin-panel.md)          | [x] | Admin shell + login + products table + form + orders + messages |
| 22 | [Accessibility review (WCAG 2.1 AA)](./22-accessibility-review.md) | [x] | Findings recorded |
| 23 | [Design critique](./23-design-critique.md)            | [x] | Findings recorded |
| 24 | [Local dev + deployment](./24-local-dev-and-deploy.md) | [x] | README at repo root covers local setup |
| 25 | [Design critique (pass 2)](./25-design-critique-followup.md) | [x] | Live-site + static findings, prioritised follow-ups |
| 26 | [Railway deployment (Chrome-MCP auto-setup)](./26-railway-deployment.md) | [ ] | Plan written; awaiting Dockerfiles + first deploy |
