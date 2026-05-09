# 08 — Seed Mock Soap Catalog

Management command `python manage.py seed_catalog` that is **idempotent**
(safe to re-run). It creates:

1. The four categories, in display order:
   - `tallow` — Tallow Soaps / סבוני חֵלֶב
   - `olive-oil` — Olive Oil Based / על בסיס שמן זית
   - `vegan` — Vegan Soaps / סבונים טבעוניים
   - `specials` — Specials / מבצעים

2. 3–4 products per category with bilingual copy and evocative descriptions.
   Prices in ILS cents. Stock set to 25.

3. A store admin user `rebecca` with password `ChangeMe!123` and
   `is_store_admin=True`.

## Image strategy
MVP uses public Unsplash image URLs so the cards aren't blank. Each product stores
an `image_url`; switching to uploaded images later is a swap for a `FileField`.

## Example product
```python
Product.objects.update_or_create(
    sku='OLI-LAV-01',
    defaults={
        'category': olive_oil,
        'name_en': 'Lavender Fields Olive Soap',
        'name_he': 'סבון זית שדות לבנדר',
        'description_en': 'A gentle bar cold-processed with extra virgin olive oil and '
                          'Bulgarian lavender. Leaves skin soft and faintly fragrant.',
        'description_he': 'חפיסה עדינה המיוצרת בתהליך קר משמן זית כתית מעולה ולבנדר בולגרי. '
                          'משאירה את העור רך ובעל ניחוח קליל.',
        'ingredients_en': 'Olive oil, coconut oil, lye, lavender essential oil, lavender buds',
        'ingredients_he': 'שמן זית, שמן קוקוס, נתרן הידרוקסידי, שמן אתרי לבנדר, פרחי לבנדר',
        'price_cents': 3500,
        'stock': 25,
        'is_featured': True,
        'image_url': 'https://images.unsplash.com/photo-1600857062241-98ce0d2e6e4b?w=800',
    },
)
```
