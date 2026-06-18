import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  {
    path: 'blog',
    loadComponent: () => import('./blog/blog').then((m) => m.BlogComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact').then((m) => m.ContactComponent),
  },
];
