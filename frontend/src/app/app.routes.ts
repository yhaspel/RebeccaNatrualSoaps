import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { PublicShellComponent } from './shared/layout/public-shell.component';
import { AdminShellComponent } from './features/admin/admin-shell.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminShellComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/admin/admin-login/admin-login.component').then((m) => m.AdminLoginComponent),
      },
      {
        path: '',
        canActivate: [adminGuard],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'products' },
          {
            path: 'products',
            loadComponent: () =>
              import('./features/admin/admin-products/admin-products.component').then(
                (m) => m.AdminProductsComponent,
              ),
          },
          {
            path: 'products/new',
            loadComponent: () =>
              import('./features/admin/admin-product-form/admin-product-form.component').then(
                (m) => m.AdminProductFormComponent,
              ),
          },
          {
            path: 'products/:id/edit',
            loadComponent: () =>
              import('./features/admin/admin-product-form/admin-product-form.component').then(
                (m) => m.AdminProductFormComponent,
              ),
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./features/admin/admin-orders/admin-orders.component').then(
                (m) => m.AdminOrdersComponent,
              ),
          },
          {
            path: 'messages',
            loadComponent: () =>
              import('./features/admin/admin-messages/admin-messages.component').then(
                (m) => m.AdminMessagesComponent,
              ),
          },
        ],
      },
    ],
  },
  {
    path: '',
    component: PublicShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/products.component').then((m) => m.ProductsComponent),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/product-detail/product-detail.component').then(
            (m) => m.ProductDetailComponent,
          ),
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
      },
      {
        path: 'checkout/success',
        loadComponent: () =>
          import('./features/checkout/checkout-success.component').then(
            (m) => m.CheckoutSuccessComponent,
          ),
      },
      {
        path: 'auth/login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'auth/register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'account',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/account/account.component').then((m) => m.AccountComponent),
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/contact/contact.component').then((m) => m.ContactComponent),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
