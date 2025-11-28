import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/posts',
    pathMatch: 'full'
  },
  {
    path: 'posts',
    loadComponent: () => import('./features/posts/posts-list/posts-list.component').then(m => m.PostsListComponent)
  },
  {
    path: 'posts/:id',
    loadComponent: () => import('./features/posts/post-detail/post-detail.component').then(m => m.PostDetailComponent)
  },
  {
    path: '**',
    redirectTo: '/posts'
  }
];
