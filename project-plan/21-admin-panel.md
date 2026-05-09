# 21 — Admin Panel (Custom UI at /admin)

**Not** Django admin — this is the Angular-side store admin. Rebecca signs in,
manages soaps, and can see orders and contact messages.

## Routes
```
/admin/login        (public)
/admin              (guarded, redirects to /admin/products)
/admin/products     (list + "New product" CTA)
/admin/products/new
/admin/products/:id/edit
/admin/orders
/admin/orders/:id
/admin/messages
```

## Guard
`adminGuard` — must be logged in AND `currentUser.is_store_admin === true`.
Anything else → redirect to `/admin/login`.

## Admin login screen
Separate chrome from the public site: minimal page, brand mark, form with
username + password. Posts to `/api/auth/admin-login/`. On success the user
lands on `/admin/products`.

## Product form
Two-column layout on desktop:
- Column 1: English fields (name, description, ingredients).
- Column 2: Hebrew fields (with `dir="rtl"` on the textarea).
- Below: category dropdown, price, stock, image URL, featured toggle, active toggle.

Save posts to `POST /api/admin/products/` or `PATCH /api/admin/products/:id/`.
Success shows inline toast and navigates back to list.

## Product list
Table-like grid with thumbnail, name (localized), category, price, stock, status
chip, actions (Edit / Delete). Delete confirms before soft-deleting.

## Orders view
Paginated list; clicking a row opens detail with status select (pending/paid/
fulfilled/canceled). Changing status PATCHes the order.

## Messages view
List of contact messages with name, subject, preview, received time, handled
checkbox.

## i18n
The admin is primarily English but also translated to Hebrew since the admin
may be a Hebrew speaker. All strings are keyed under `admin.*`.
