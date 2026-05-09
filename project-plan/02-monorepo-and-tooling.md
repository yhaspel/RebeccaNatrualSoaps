# 02 — Monorepo & Tooling

## Layout
```
RebeccasNaturalSoaps/
├── backend/                  # Django 5
│   ├── apps/
│   │   ├── users/
│   │   ├── catalog/
│   │   ├── orders/
│   │   └── contact/
│   ├── config/
│   │   └── settings/{base,dev,prod}.py
│   ├── requirements/{base,dev,prod}.txt
│   └── manage.py
├── frontend/                 # Angular 19
│   ├── src/app/
│   │   ├── core/
│   │   ├── abstraction/
│   │   └── features/
│   ├── src/assets/i18n/{en.json,he.json}
│   ├── angular.json
│   └── package.json
├── project-plan/             # this folder
├── README.md
└── .gitignore
```

## Tooling decisions
- **Python** 3.11+ with `venv`.
- **Node** 20+ with `npm`.
- **Tailwind CSS** for rapid layout; SCSS for component-scoped tweaks.
- **Transloco** (`@jsverse/transloco`) for i18n — better runtime language switching
  than Angular's built-in `@angular/localize` (which wants one build per locale).
- **Grow (Meshulam) hosted payment page** for payments (PCI-compliant; the
  shopper enters card details on Grow's hosted page, never on our site).

## Conventions
- Imperative commit messages, present tense.
- Feature folders own their routes file (`features/<x>/<x>.routes.ts`).
- Every `.ts` file that has behavior has a matching `.spec.ts`.
- No hardcoded strings in templates — only translation keys.
