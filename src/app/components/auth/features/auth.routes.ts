import { Routes } from "@angular/router";

export default [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component')
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component')
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.component')
  },
  {
    path: 'tyc',
    loadComponent: () => import('./tyc/tyc.component'),
  }
] as Routes;
