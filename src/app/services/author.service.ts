import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Author, CreateAuthor, UpdateAuthor } from '../models';

export interface AuthorListResponse {
  authors: Author[];
}

export interface AuthorResponse {
  author: Author;
}

@Injectable({ providedIn: 'root' })
export class AuthorService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/authors`;

  /** GET /authors */
  getAuthors(): Observable<AuthorListResponse> {
    return this.http.get<AuthorListResponse>(this.baseUrl);
  }

  /** GET /authors/:id */
  getAuthor(id: string): Observable<AuthorResponse> {
    return this.http.get<AuthorResponse>(`${this.baseUrl}/${id}`);
  }

  /** POST /authors */
  createAuthor(payload: CreateAuthor): Observable<AuthorResponse> {
    return this.http.post<AuthorResponse>(this.baseUrl, payload);
  }

  /** PUT /authors/:id */
  updateAuthor(id: string, payload: UpdateAuthor): Observable<AuthorResponse> {
    return this.http.put<AuthorResponse>(`${this.baseUrl}/${id}`, payload);
  }

  /** DELETE /authors/:id */
  deleteAuthor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
