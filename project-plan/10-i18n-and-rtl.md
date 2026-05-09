# 10 — i18n (English & Hebrew) + RTL

## Library
Transloco — runtime language switching, no rebuild required.

## Translation files
`src/assets/i18n/en.json` and `src/assets/i18n/he.json` have the **same key tree**.
Every string in a template or component is referenced via a key — never a literal.

Top-level namespaces: `common`, `nav`, `home`, `products`, `productDetail`, `cart`,
`checkout`, `auth`, `account`, `about`, `contact`, `admin`, `validation`, `errors`,
`footer`, `categories`.

## Direction + lang attributes
The `I18nFacade` updates:
- `document.documentElement.lang = currentLang`
- `document.documentElement.dir = currentLang === 'he' ? 'rtl' : 'ltr'`

Persist to `localStorage('rns_lang')`. On bootstrap, read it back and set the
initial language.

## Tailwind RTL
- Use **logical properties** (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`)
  or Tailwind's `rtl:` variants.
- Icons that carry direction (arrows, chevrons) flip via `rtl:rotate-180` /
  `rtl:-scale-x-100`.

## Product-field translation pipe
```typescript
// translate-field.pipe.ts
@Pipe({ name: 'tf', standalone: true, pure: false })
export class TranslateFieldPipe implements PipeTransform {
  private i18n = inject(I18nFacade);
  transform(obj: Record<string, any> | null | undefined, baseKey: string): string {
    if (!obj) return '';
    const lang = this.i18n.language();
    return obj[`${baseKey}_${lang}`] ?? obj[`${baseKey}_en`] ?? '';
  }
}
```
Used in templates as `{{ product | tf:'name' }}`.

## Sample keys (excerpt)
```json
// en.json
{
  "nav": { "home": "Home", "products": "Shop", "about": "About", "contact": "Contact", "cart": "Cart", "login": "Sign in", "account": "My account", "logout": "Sign out" },
  "categories": { "tallow": "Tallow Soaps", "olive-oil": "Olive Oil", "vegan": "Vegan", "specials": "Specials" },
  "common": { "loading": "Loading…", "addToCart": "Add to cart", "outOfStock": "Out of stock" }
}
```
```json
// he.json  (same keys)
{
  "nav": { "home": "בית", "products": "חנות", "about": "אודות", "contact": "צור קשר", "cart": "עגלה", "login": "התחברות", "account": "החשבון שלי", "logout": "התנתקות" },
  "categories": { "tallow": "סבוני חֵלֶב", "olive-oil": "שמן זית", "vegan": "טבעוני", "specials": "מבצעים" },
  "common": { "loading": "טוען…", "addToCart": "הוספה לעגלה", "outOfStock": "אזל מהמלאי" }
}
```
