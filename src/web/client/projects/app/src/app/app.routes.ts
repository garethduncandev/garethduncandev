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
    path: 'blog/:slug',
    loadComponent: () => import('./blog/blog-post').then((m) => m.BlogPostComponent),
  },
  {
    path: 'notes',
    loadComponent: () => import('./notes/notes').then((m) => m.NotesComponent),
  },
  {
    path: 'notes/:slug',
    loadComponent: () => import('./notes/note').then((m) => m.NoteComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact').then((m) => m.Contact),
  },
    {
    path: 'find',
    loadComponent: () => import('./find/find').then((m) => m.Find),
  },
];
