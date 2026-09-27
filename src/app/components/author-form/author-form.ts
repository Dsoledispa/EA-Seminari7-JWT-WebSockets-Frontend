import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Author, AuthorRole, CreateAuthor } from '../../models';
import { AuthorService } from '../../services/author.service';
import { apiErrorMessage } from '../../utils/api-error';
import { removeEmpty } from '../../utils/remove-empty';

@Component({
  selector: 'app-author-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './author-form.html',
  styleUrl: './author-form.css',
})
export class AuthorForm implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private authorService = inject(AuthorService);
  private router = inject(Router);

  // El :id de la ruta authors/:id/edit llega aquí gracias a withComponentInputBinding().
  // En authors/new no hay id, así que el formulario sirve para crear
  id = input<string>();

  loading = signal(false);
  saving = signal(false);
  error = signal('');

  // Reglas parecidas a las que valida el backend, así casi todos los errores se ven antes de enviar
  form = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    birthDate: [''],
    nationality: [''],
    website: ['', Validators.pattern(/^https?:\/\/\S+$/)],
    active: [true],
    role: ['author' as AuthorRole],
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      return;
    }

    // Si vengo del botón Editar del listado, el autor ya viene en el state de la navegación
    const author: Author | undefined = history.state?.author;
    if (author?._id === id) {
      this.fillForm(author);
      return;
    }

    // Si he recargado la página ya no hay state, así que se lo pido a la API
    this.loading.set(true);
    this.authorService.getAuthor(id).subscribe({
      next: (response) => {
        this.fillForm(response.author);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.id();
    const author = removeEmpty(this.form.getRawValue()) as CreateAuthor;
    const request = id
      ? this.authorService.updateAuthor(id, author)
      : this.authorService.createAuthor(author);

    this.saving.set(true);
    this.error.set('');
    request.subscribe({
      next: () => this.router.navigate(['/authors']),
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.saving.set(false);
      },
    });
  }

  private fillForm(author: Author): void {
    // La API nunca devuelve la contraseña, así que ese campo se queda vacío
    this.form.patchValue({
      name: author.name,
      email: author.email,
      birthDate: author.birthDate?.slice(0, 10) ?? '',
      nationality: author.nationality ?? '',
      website: author.website ?? '',
      active: author.active ?? true,
      role: author.role ?? 'author',
    });
  }
}
