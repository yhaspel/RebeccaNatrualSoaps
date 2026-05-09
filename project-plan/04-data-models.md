# 04 — Data Models

## Catalog
```python
# apps/catalog/models.py
class Category(models.Model):
    slug = models.SlugField(unique=True)        # tallow | olive-oil | vegan | specials
    name_en = models.CharField(max_length=80)
    name_he = models.CharField(max_length=80)
    description_en = models.TextField(blank=True)
    description_he = models.TextField(blank=True)
    display_order = models.PositiveSmallIntegerField(default=0)

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.PROTECT)
    sku = models.CharField(max_length=40, unique=True)
    name_en = models.CharField(max_length=120)
    name_he = models.CharField(max_length=120)
    description_en = models.TextField()
    description_he = models.TextField()
    ingredients_en = models.TextField(blank=True)
    ingredients_he = models.TextField(blank=True)
    price_cents = models.PositiveIntegerField()   # store money in cents
    currency = models.CharField(max_length=3, default='ILS')
    stock = models.PositiveIntegerField(default=0)
    image_url = models.URLField(blank=True)       # external CDN or /media/ path
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

Bilingual-field approach: simple twin columns beats a heavier `django-parler` setup
for a two-language MVP and keeps the API flat.

## Orders
```python
# apps/orders/models.py
class Order(models.Model):
    class Status(models.TextChoices):
        PENDING_PAYMENT = 'pending_payment', 'Pending payment'
        PAID = 'paid', 'Paid'
        FULFILLED = 'fulfilled', 'Fulfilled'
        CANCELED = 'canceled', 'Canceled'

    user = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL)
    email = models.EmailField()
    full_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=30, blank=True)
    shipping_line1 = models.CharField(max_length=200)
    shipping_line2 = models.CharField(max_length=200, blank=True)
    shipping_city = models.CharField(max_length=120)
    shipping_postal_code = models.CharField(max_length=30)
    shipping_country = models.CharField(max_length=2, default='IL')
    subtotal_cents = models.PositiveIntegerField()
    shipping_cents = models.PositiveIntegerField(default=0)
    total_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default='ILS')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING_PAYMENT)
    grow_process_id = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('catalog.Product', on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price_cents = models.PositiveIntegerField()      # snapshot at purchase
    product_name_snapshot = models.CharField(max_length=240)  # "name_en / name_he"
```

Server-side total = Σ(items) + shipping. Client total is never trusted for payment.

## Contact
```python
class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    language = models.CharField(max_length=5, default='en')
    created_at = models.DateTimeField(auto_now_add=True)
    handled = models.BooleanField(default=False)
```
