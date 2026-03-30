import { Routes } from '@angular/router'
import { AuthService } from './modules/global/services/auth/auth.service'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'signin',
    loadComponent: () => import('./modules/global/pages/signin/signin.component').then(m => m.SigninComponent),
    canActivate: [AuthService]
  },
  {
    path: 'register',
    loadComponent: () => import('./modules/global/pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [AuthService]
  },
  {
    path: 'forget-password',
    loadComponent: () => import('./modules/global/pages/forget-password/forget-password.component').then(m => m.ForgetPasswordComponent),
    canActivate: [AuthService]
  },
  {
    path: 'home',
    loadComponent: () => import('./modules/global/pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [AuthService]
  },
  {
    path: 'subscriptions',
    loadComponent: () => import('./modules/subscriptions/pages/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent),
    canActivate: [AuthService]
  },
  {
    path: 'payments',
    loadComponent: () => import('./modules/payments/pages/payments/payments.component').then(m => m.PaymentsComponent),
    canActivate: [AuthService]
  },
  {
    path: 'profile',
    loadComponent: () => import('./modules/users/pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthService]
  },
  {
    path: '**',
    loadComponent: () => import('./modules/global/pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
]
