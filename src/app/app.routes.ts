import { Routes } from '@angular/router';

import { AuthorForm } from './components/author-form/author-form';
import { AuthorsList } from './components/authors-list/authors-list';
import { BooksList } from './components/books-list/books-list';

export const routes: Routes = [
  { path: '', redirectTo: 'authors', pathMatch: 'full' },
  { path: 'authors', component: AuthorsList, title: 'Autores' },
  { path: 'authors/new', component: AuthorForm, title: 'Nuevo autor' },
  // El mismo formulario sirve para editar: el :id le llega como input
  { path: 'authors/:id/edit', component: AuthorForm, title: 'Editar autor' },
  { path: 'books', component: BooksList, title: 'Libros' },
  // Cualquier otra URL vuelve al listado de autores
  { path: '**', redirectTo: 'authors' },
];
