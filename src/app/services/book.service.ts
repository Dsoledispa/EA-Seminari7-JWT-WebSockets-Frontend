import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Book, CreateBook, UpdateBook } from '../models';

export interface BookListResponse {
  books: Book[];
}

export interface BookResponse {
  book: Book;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/books`;

  /** GET /books */
  getBooks(): Observable<BookListResponse> {
    return this.http.get<BookListResponse>(this.baseUrl);
  }

  /** GET /books/:id */
  getBook(id: string): Observable<BookResponse> {
    return this.http.get<BookResponse>(`${this.baseUrl}/${id}`);
  }

  /** POST /books */
  createBook(payload: CreateBook): Observable<BookResponse> {
    return this.http.post<BookResponse>(this.baseUrl, payload);
  }

  /** PUT /books/:id */
  updateBook(id: string, payload: UpdateBook): Observable<BookResponse> {
    return this.http.put<BookResponse>(`${this.baseUrl}/${id}`, payload);
  }

  /** DELETE /books/:id */
  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
