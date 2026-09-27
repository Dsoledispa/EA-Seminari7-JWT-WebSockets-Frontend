import { Routes } from '@angular/router';

import { AuthorsList } from './components/authors-list/authors-list';

export const routes: Routes = [
  { path: '', redirectTo: 'authors', pathMatch: 'full' },
  { path: 'authors', component: AuthorsList, title: 'Autores' },
  // Cualquier otra URL vuelve al listado de autores
  { path: '**', redirectTo: 'authors' },
];
