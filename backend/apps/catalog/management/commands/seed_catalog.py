"""Idempotent seed for categories, products, and the store admin user."""
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.catalog.models import Category, Product

User = get_user_model()

CATEGORIES = [
    {
        "slug": "tallow",
        "name_en": "Tallow Soaps",
        "name_he": "סבוני חֵלֶב",
        "description_en": "Nutrient-rich bars made with grass-fed beef tallow — "
                          "deeply moisturising for dry and sensitive skin.",
        "description_he": "סבונים עשירים בנוטריינטים על בסיס חלב פרות שאכלו עשב — "
                          "מזינים לעומק ומתאימים לעור יבש ורגיש.",
        "display_order": 10,
    },
    {
        "slug": "olive-oil",
        "name_en": "Olive Oil Based",
        "name_he": "על בסיס שמן זית",
        "description_en": "Classic cold-process soaps with extra virgin olive oil — "
                          "gentle, mild, and full of character.",
        "description_he": "סבונים קלאסיים בתהליך קר עם שמן זית כתית מעולה — "
                          "עדינים, רכים ובעלי אופי.",
        "display_order": 20,
    },
    {
        "slug": "vegan",
        "name_en": "Vegan Soaps",
        "name_he": "סבונים טבעוניים",
        "description_en": "100% plant-based soaps made from olive, coconut, and "
                          "shea — without a drop of animal ingredients.",
        "description_he": "סבונים מהצומח בלבד משמן זית, קוקוס ושיאה — ללא כל "
                          "רכיב מן החי.",
        "display_order": 30,
    },
    {
        "slug": "specials",
        "name_en": "Specials",
        "name_he": "מבצעים",
        "description_en": "Small-batch and seasonal bars. When they're gone, "
                          "they're gone.",
        "description_he": "תמהילים מיוחדים ומהדורות עונתיות. עד גמר המלאי.",
        "display_order": 40,
    },
]

PRODUCTS = [
    # --- Tallow ---
    {
        "category": "tallow",
        "sku": "TAL-HON-01",
        "name_en": "Honey & Tallow Bar",
        "name_he": "סבון חלב ודבש",
        "description_en": "Creamy lather from grass-fed tallow softened with raw "
                          "wildflower honey. A hug for dry skin in winter.",
        "description_he": "סבון קרמי מחֵלֶב עדרים שאכלו עשב, מתובל בדבש פרחי בר. "
                          "חיבוק לעור יבש בחורף.",
        "ingredients_en": "Grass-fed beef tallow, olive oil, raw honey, lye",
        "ingredients_he": "חֵלֶב בקר מעשב, שמן זית, דבש גולמי, נתרן הידרוקסידי",
        "price_cents": 4200,
        "stock": 30,
        "image_url": "/assets/products/honey-tallow.jpg",
        "is_featured": True,
    },
    {
        "category": "tallow",
        "sku": "TAL-EUC-02",
        "name_en": "Eucalyptus Tallow Bar",
        "name_he": "סבון חלב אקליפטוס",
        "description_en": "A bracing morning bar — eucalyptus essential oil over "
                          "a rich, nourishing tallow base.",
        "description_he": "סבון בוקר מרענן — שמן אתרי של אקליפטוס על בסיס חֵלֶב "
                          "עשיר ומזין.",
        "ingredients_en": "Tallow, olive oil, coconut oil, eucalyptus essential oil, lye",
        "ingredients_he": "חלב, שמן זית, שמן קוקוס, שמן אתרי אקליפטוס, נתרן הידרוקסידי",
        "price_cents": 3800,
        "stock": 20,
        "image_url": "/assets/products/eucalyptus-tallow.jpg",
    },
    {
        "category": "tallow",
        "sku": "TAL-UNS-03",
        "name_en": "Unscented Sensitive Bar",
        "name_he": "סבון עדין ללא בישום",
        "description_en": "Only what your skin actually needs — tallow, olive oil, "
                          "water, lye. No added scent.",
        "description_he": "רק מה שהעור באמת צריך — חלב, שמן זית, מים, נתרן. "
                          "ללא בישום.",
        "ingredients_en": "Tallow, olive oil, water, lye",
        "ingredients_he": "חלב, שמן זית, מים, נתרן הידרוקסידי",
        "price_cents": 3200,
        "stock": 40,
        "image_url": "/assets/products/unscented-sensitive.jpg",
    },

    # --- Olive Oil ---
    {
        "category": "olive-oil",
        "sku": "OLI-LAV-01",
        "name_en": "Lavender Fields Olive Soap",
        "name_he": "סבון זית שדות לבנדר",
        "description_en": "A gentle bar cold-processed with extra virgin olive oil "
                          "and Bulgarian lavender. Leaves skin soft and faintly fragrant.",
        "description_he": "חפיסה עדינה בתהליך קר משמן זית כתית מעולה ולבנדר בולגרי. "
                          "משאירה את העור רך ובעל ניחוח קליל.",
        "ingredients_en": "Olive oil, coconut oil, lye, lavender essential oil, lavender buds",
        "ingredients_he": "שמן זית, שמן קוקוס, נתרן הידרוקסידי, שמן אתרי לבנדר, פרחי לבנדר",
        "price_cents": 3500,
        "stock": 35,
        "image_url": "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=900",
        "is_featured": True,
    },
    {
        "category": "olive-oil",
        "sku": "OLI-ROS-02",
        "name_en": "Rosemary & Mint Olive Soap",
        "name_he": "סבון זית רוזמרין ונענע",
        "description_en": "Herb-garden fresh. Rosemary and peppermint essential oils "
                          "over a classic castile base.",
        "description_he": "ריח של גינה. שמנים אתריים של רוזמרין ומנתה על בסיס "
                          "קסטיליה קלאסי.",
        "ingredients_en": "Olive oil, coconut oil, rosemary EO, peppermint EO, lye",
        "ingredients_he": "שמן זית, שמן קוקוס, שמן אתרי רוזמרין, שמן אתרי מנתה, נתרן",
        "price_cents": 3500,
        "stock": 28,
        "image_url": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=900",
    },
    {
        "category": "olive-oil",
        "sku": "OLI-CAS-03",
        "name_en": "Pure Castile (Unscented)",
        "name_he": "קסטיליה טהור",
        "description_en": "75% olive oil, a creamy lather, and absolutely nothing "
                          "else. For the purists.",
        "description_he": "75% שמן זית, קצף קרמי, ובלי שום תוספת. לאוהבי הטהור.",
        "ingredients_en": "Olive oil (75%), coconut oil, water, lye",
        "ingredients_he": "שמן זית (75%), שמן קוקוס, מים, נתרן הידרוקסידי",
        "price_cents": 3000,
        "stock": 40,
        "image_url": "https://images.unsplash.com/photo-1599458448510-59aecaea4752?w=900",
    },

    # --- Vegan ---
    {
        "category": "vegan",
        "sku": "VEG-COC-01",
        "name_en": "Coconut & Shea Butter",
        "name_he": "קוקוס וחמאת שיאה",
        "description_en": "Tropical comfort. Shea butter softens; coconut oil makes "
                          "the lather rich and airy.",
        "description_he": "נוחות טרופית. חמאת שיאה מרככת, שמן קוקוס יוצר קצף עשיר "
                          "ואוורירי.",
        "ingredients_en": "Olive oil, coconut oil, shea butter, water, lye",
        "ingredients_he": "שמן זית, שמן קוקוס, חמאת שיאה, מים, נתרן הידרוקסידי",
        "price_cents": 3600,
        "stock": 32,
        "image_url": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=900",
        "is_featured": True,
    },
    {
        "category": "vegan",
        "sku": "VEG-OAT-02",
        "name_en": "Oatmeal & Almond Milk",
        "name_he": "שיבולת שועל וחלב שקדים",
        "description_en": "Gentle exfoliation from stone-ground oats; almond milk "
                          "leaves skin velvety.",
        "description_he": "פילינג עדין משיבולת שועל טחונה; חלב שקדים מותיר את העור "
                          "קטיפתי.",
        "ingredients_en": "Olive oil, coconut oil, oats, almond milk, lye",
        "ingredients_he": "שמן זית, שמן קוקוס, שיבולת שועל, חלב שקדים, נתרן הידרוקסידי",
        "price_cents": 3400,
        "stock": 25,
        "image_url": "https://images.unsplash.com/photo-1615842974426-55c372fd8d8b?w=900",
    },
    {
        "category": "vegan",
        "sku": "VEG-CHA-03",
        "name_en": "Activated Charcoal Bar",
        "name_he": "סבון פחם פעיל",
        "description_en": "Deep-clean your pores with activated charcoal on a gentle "
                          "olive-coconut base.",
        "description_he": "ניקוי עמוק של הנקבוביות עם פחם פעיל על בסיס עדין של "
                          "זית וקוקוס.",
        "ingredients_en": "Olive oil, coconut oil, activated charcoal, tea tree EO, lye",
        "ingredients_he": "שמן זית, שמן קוקוס, פחם פעיל, שמן אתרי עץ התה, נתרן",
        "price_cents": 3800,
        "stock": 22,
        "image_url": "/assets/products/charcoal.jpg",
    },

    # --- Specials ---
    {
        "category": "specials",
        "sku": "SPE-GIFT-01",
        "name_en": "Trio Gift Set",
        "name_he": "מארז שלישייה",
        "description_en": "Three bestsellers boxed in recycled kraft — lavender, "
                          "honey-tallow, and charcoal. Save 15%.",
        "description_he": "שלושת רבי המכר באריזת קראפט ממוחזרת — לבנדר, חלב-דבש "
                          "ופחם. חיסכון של 15%.",
        "ingredients_en": "See individual bar ingredients on the products pages.",
        "ingredients_he": "פירוט רכיבים מופיע בעמודי המוצר של הסבונים בנפרד.",
        "price_cents": 9900,
        "stock": 15,
        "image_url": "/assets/products/trio-gift.jpg",
        "is_featured": True,
    },
    {
        "category": "specials",
        "sku": "SPE-SEA-02",
        "name_en": "Seasonal: Orange & Clove",
        "name_he": "עונתי: תפוז וציפורן",
        "description_en": "A limited winter edition — sweet orange peel and warming "
                          "clove on our creamy olive base.",
        "description_he": "מהדורה מוגבלת לחורף — קליפת תפוז מתוק וציפורן מחממת על "
                          "בסיס שמן הזית הקרמי שלנו.",
        "ingredients_en": "Olive oil, coconut oil, orange EO, clove EO, orange peel, lye",
        "ingredients_he": "שמן זית, שמן קוקוס, שמן אתרי תפוז, שמן אתרי ציפורן, קליפות תפוז, נתרן",
        "price_cents": 3900,
        "stock": 18,
        "image_url": "/assets/products/orange-clove.jpg",
    },
    {
        "category": "specials",
        "sku": "SPE-SAM-03",
        "name_en": "Try-It Sampler (4 minis)",
        "name_he": "מארז טעימות (4 מיני)",
        "description_en": "One mini bar from each of our four families. The perfect "
                          "way to find your favourite.",
        "description_he": "מיני-סבון אחד מכל אחת מארבע המשפחות שלנו. הדרך הטובה "
                          "ביותר למצוא את הטעם שלך.",
        "ingredients_en": "Varies by bar — see sampler card.",
        "ingredients_he": "משתנה לפי סבון — ראו הכרטיס במארז.",
        "price_cents": 5500,
        "stock": 12,
        "image_url": "/assets/products/sampler.jpg",
    },
]


class Command(BaseCommand):
    help = "Seed categories, products, and the store admin user (idempotent)."

    def handle(self, *args, **options) -> None:
        # Categories
        category_by_slug = {}
        for data in CATEGORIES:
            obj, _ = Category.objects.update_or_create(
                slug=data["slug"],
                defaults={k: v for k, v in data.items() if k != "slug"},
            )
            category_by_slug[data["slug"]] = obj
        self.stdout.write(self.style.SUCCESS(f"Categories: {len(category_by_slug)}"))

        # Products
        for data in PRODUCTS:
            category = category_by_slug[data.pop("category")]
            sku = data.pop("sku")
            Product.objects.update_or_create(
                sku=sku,
                defaults={"category": category, **data, "is_active": True},
            )
        self.stdout.write(self.style.SUCCESS(f"Products: {len(PRODUCTS)}"))

        # Store admin
        username = settings.SEED_ADMIN_USERNAME
        admin, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": settings.SEED_ADMIN_EMAIL,
                "is_store_admin": True,
                "first_name": "Rebecca",
                "last_name": "",
            },
        )
        admin.is_store_admin = True
        if created or not admin.has_usable_password():
            admin.set_password(settings.SEED_ADMIN_PASSWORD)
        admin.save()
        self.stdout.write(
            self.style.SUCCESS(
                f"Store admin: {admin.username} ({'created' if created else 'updated'})"
            )
        )
