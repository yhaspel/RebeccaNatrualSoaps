# 18 — Auth Pages + Account

## Routes
```
/auth/login
/auth/register
/account          (guarded)
/account/orders   (guarded)
/account/orders/:id  (guarded)
```

## AuthFacade signals
```
language, loading, error, isLoggedIn, currentUser, isStoreAdmin
```

## Pages
- **Login** — email + password, link to register, link to admin login (subtle).
- **Register** — username + email + password + confirm password.
- **Account** — greeting, profile card, link to orders, sign out.
- **Orders** — list of the user's orders, status chip, total, link to detail.
- **Order detail** — full items, shipping address, total, status.

## JWT storage
`localStorage` under `rns_access` / `rns_refresh`. A refresh interceptor
catches `401`, calls `/auth/refresh/`, retries once; if that fails it logs out.

## Guards
- `authGuard` — ensures logged in or redirects to `/auth/login?next=…`.
- `adminGuard` — additionally requires `is_store_admin`.
