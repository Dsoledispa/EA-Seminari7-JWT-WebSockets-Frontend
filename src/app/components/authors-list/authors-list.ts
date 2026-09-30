import { DatePipe, NgStyle, UpperCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Author } from '../../models';
import { AuthorService } from '../../services/author.service';
import { apiErrorMessage } from '../../utils/api-error';
import { Pagination } from '../pagination/pagination';
import { ConfirmModal } from '../confirm-modal/confirm-modal';

// Autores que se ven en cada página de la tabla
const PAGE_SIZE = 4;

@Component({
  selector: 'app-authors-list',
  imports: [FormsModule, RouterLink, DatePipe, UpperCasePipe, NgStyle, Pagination, ConfirmModal],
  templateUrl: './authors-list.html',
  styleUrl: './authors-list.css',
})
export class AuthorsList implements OnInit {
  private authorService = inject(AuthorService);
  private router = inject(Router);

  // Antes: authors: Author[] = [];
  authors = signal<Author[]>([]);
  loading = signal(true);
  error = signal('');

  // Texto del buscador (va con [(ngModel)]) y página en la que estoy
  search = signal('');
  page = signal(1);

  authorToDelete = signal<Author | null>(null);

  deleteMessage = computed(() => {
    const author = this.authorToDelete();
    return author
      ? `¿Borrar a ${author.name}? Sus libros no se borran, pero dejarán de tenerlo como autor.`
      : '';
  });

  // Me quedo con los autores cuyo nombre o email contiene lo que se ha escrito
  filteredAuthors = computed(() => {
    const text = this.search().trim().toLowerCase();
    return this.authors().filter(
      (author) =>
        author.name.toLowerCase().includes(text) || author.email.toLowerCase().includes(text),
    );
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAuthors().length / PAGE_SIZE)));

  // Si borro el último autor de la última página, así no me quedo en una página vacía
  currentPage = computed(() => Math.min(this.page(), this.totalPages()));

  pageAuthors = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filteredAuthors().slice(start, start + PAGE_SIZE);
  });

  ngOnInit(): void {
    this.authorService.getAuthors().subscribe({
      next: (response) => {
        this.authors.set(response.authors);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.loading.set(false);
      },
    });
  }

  edit(author: Author): void {
    // Además del :id en la URL, le paso el autor entero en el state de la navegación.
    // Así el formulario no tiene que volver a pedirlo a la API
    this.router.navigate(['/authors', author._id, 'edit'], { state: { author } });
  }

    deleteAuthor(author: Author): void {
    this.authorToDelete.set(author);
  }

  confirmDelete(): void {
    const author = this.authorToDelete();
    if (!author) {
      return;
    }

    this.error.set('');
    this.authorService.deleteAuthor(author._id).subscribe({
      // La API responde 204 sin datos, así que lo quito yo de la lista
       next: () => {
      this.authors.update((authors) => authors.filter((a) => a._id !== author._id));
      this.authorToDelete.set(null);
    },
      error: (err: HttpErrorResponse) => this.error.set(apiErrorMessage(err)),
    });
  }

  cancelDelete(): void {
    this.authorToDelete.set(null);
  }
}
