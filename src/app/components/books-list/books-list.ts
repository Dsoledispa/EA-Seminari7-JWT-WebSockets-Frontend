import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Book } from '../../models';
import { LanguageNamePipe } from '../../pipes/language-name-pipe';
import { BookService } from '../../services/book.service';
import { apiErrorMessage } from '../../utils/api-error';
import { Pagination } from '../pagination/pagination';

// Libros que se ven en cada página de la tabla
const PAGE_SIZE = 4;

@Component({
  selector: 'app-books-list',
  imports: [FormsModule, CurrencyPipe, LanguageNamePipe, Pagination],
  templateUrl: './books-list.html',
  styleUrl: './books-list.css',
})
export class BooksList implements OnInit {
  private bookService = inject(BookService);

  books = signal<Book[]>([]);
  loading = signal(true);
  error = signal('');

  search = signal('');
  page = signal(1);

  // Me quedo con los libros cuyo título o ISBN contiene lo que se ha escrito
  filteredBooks = computed(() => {
    const text = this.search().trim().toLowerCase();
    return this.books().filter(
      (book) => book.title.toLowerCase().includes(text) || book.isbn.toLowerCase().includes(text),
    );
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredBooks().length / PAGE_SIZE)));

  currentPage = computed(() => Math.min(this.page(), this.totalPages()));

  pageBooks = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filteredBooks().slice(start, start + PAGE_SIZE);
  });

  ngOnInit(): void {
    this.bookService.getBooks().subscribe({
      next: (response) => {
        this.books.set(response.books);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.loading.set(false);
      },
    });
  }

  deleteBook(book: Book): void {
    if (!confirm(`¿Borrar el libro "${book.title}"?`)) {
      return;
    }

    this.error.set('');
    this.bookService.deleteBook(book._id).subscribe({
      next: () => this.books.update((books) => books.filter((b) => b._id !== book._id)),
      error: (err: HttpErrorResponse) => this.error.set(apiErrorMessage(err)),
    });
  }
}
