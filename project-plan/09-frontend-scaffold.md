# 09 — Angular Scaffold (v19+)

## Create
```bash
npx @angular/cli@19 new frontend --standalone --routing --style=scss --ssr=false
cd frontend
npm i tailwindcss postcss autoprefixer
npx tailwindcss init
npm i @jsverse/transloco @jsverse/transloco-loader
# No payment SDK needed — Grow uses a redirect-based hosted payment page
```

## Directory layout
```
src/app/
├── core/
│   ├── models/
│   │   ├── category.model.ts
│   │   ├── product.model.ts
│   │   ├── cart.model.ts
│   │   ├── order.model.ts
│   │   └── user.model.ts
│   ├── services/
│   │   ├── api.config.ts
│   │   ├── auth.api.ts
│   │   ├── catalog.api.ts
│   │   ├── orders.api.ts
│   │   ├── contact.api.ts
│   │   └── admin.api.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── admin.guard.ts
│   ├── interceptors/
│   │   └── auth.interceptor.ts
│   └── utils/
│       └── money.ts
├── abstraction/
│   ├── auth.facade.ts
│   ├── catalog.facade.ts
│   ├── cart.facade.ts
│   ├── orders.facade.ts
│   ├── contact.facade.ts
│   ├── admin.facade.ts
│   └── i18n.facade.ts
├── features/
│   ├── home/
│   ├── products/
│   ├── product-detail/
│   ├── cart/
│   ├── checkout/
│   ├── auth/
│   ├── account/
│   ├── about/
│   ├── contact/
│   └── admin/
└── shared/
    ├── layout/{header,footer,nav}/
    ├── ui/{button,card,input,alert,empty-state,spinner}/
    └── pipes/{money,translate-field}.pipe.ts
```

## App config
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTransloco({
      config: {
        availableLangs: ['en', 'he'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      },
      loader: TranslocoHttpLoader,   // loads /assets/i18n/<lang>.json
    }),
    provideAnimations(),
  ]
};
```

## Routes (app.routes.ts)
```typescript
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'products', loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCT_ROUTES) },
  { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
  { path: 'checkout', loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: 'account', loadChildren: () => import('./features/account/account.routes').then(m => m.ACCOUNT_ROUTES), canActivate: [authGuard] },
  { path: 'about', loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) },
  { path: '**', redirectTo: '' },
];
```
