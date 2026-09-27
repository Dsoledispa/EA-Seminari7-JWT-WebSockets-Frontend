import { Component, OnInit, inject, signal } from '@angular/core';
import { Author } from '../../models';
import { AuthorService } from '../../services/author.service';

@Component({
  selector: 'app-authors-list',
  imports: [],
  templateUrl: './authors-list.html',
  styleUrl: './authors-list.css',
})
export class AuthorsList implements OnInit {
  private authorService = inject(AuthorService);

  // Antes: authors: Author[] = [];
  authors = signal<Author[]>([]);

  ngOnInit(): void {
    this.authorService.getAuthors().subscribe({
      next: (response) => {
        this.authors.set(response.authors);
      },
      error: (err) => {
        console.error('Error cargando autores', err);
      }
    });
  }
}