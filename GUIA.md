# Guía del proyecto

Aquí explicamos cómo está hecho el backoffice y dónde se ve cada punto del seminario de Angular en el
código. Para instalarlo y arrancarlo, mira el [README](README.md).

## Índice

1. [Cómo arranca la app: CSR, SSR y SPA](#1-cómo-arranca-la-app-csr-ssr-y-spa)
2. [CLI, hot reload y environments](#2-cli-hot-reload-y-environments)
3. [Componentes](#3-componentes)
4. [Servicios e inyección de dependencias](#4-servicios-e-inyección-de-dependencias)
5. [Signals](#5-signals)
6. [Data binding](#6-data-binding)
7. [Directivas y control flow](#7-directivas-y-control-flow)
8. [Pipes](#8-pipes)
9. [Routing](#9-routing)
10. [HttpClient y Observables](#10-httpclient-y-observables)
11. [Formularios](#11-formularios)
12. [Depurar con Angular DevTools](#12-depurar-con-angular-devtools)

---

## 1. Cómo arranca la app: CSR, SSR y SPA

### CSR (Client-Side Rendering)

El servidor solo manda un HTML casi vacío y el JavaScript de Angular pinta la página en el navegador.
Es lo que hace este proyecto. En `src/index.html` solo está la etiqueta del componente raíz:

```html
<body>
  <app-root></app-root>
</body>
```

Y `src/main.ts` arranca Angular sobre esa etiqueta:

```ts
bootstrapApplication(App, appConfig)
```

Para verlo en clase: con la app abierta, "Ver código fuente" (Ctrl+U) enseña el `<app-root>` vacío, e
"Inspeccionar" (F12) enseña la tabla ya pintada. Lo que sale en la tabla lo ha pintado Angular en el
navegador.

### SSR (Server-Side Rendering)

El HTML ya llega pintado desde el servidor, lo que va mejor para el SEO y para la primera carga. Aquí no
lo usamos, pero se añade con:

```
npx ng add @angular/ssr
```

Ese comando crea un `server.ts` (un servidor Express que renderiza la app), un `app.config.server.ts` y
añade `provideClientHydration()`, que hace que el navegador aproveche el HTML que llega del servidor en
vez de pintarlo otra vez.

### SPA (Single Page Application)

Solo hay un `index.html`. Al pasar de Autores a Libros la página no se recarga: el router cambia el
componente que se ve (ver el [apartado 9](#9-routing)).

## 2. CLI, hot reload y environments

Los comandos para instalar, arrancar y compilar están en el [README](README.md#scripts). Aquí solo tres
cosas más:

- El CLI de Angular viene en las dependencias del proyecto, así que no hace falta instalarlo global: se
  usa con `npx ng ...`. Los componentes y el pipe de este repo están creados con él, por ejemplo
  `npx ng generate component components/books-list --skip-tests`.
- Hot reload: con `npm start` arrancado, al guardar un fichero la página se actualiza sola. Se puede
  enseñar cambiando un texto de `navbar.html`.
- Environments: hay un solo fichero, `src/environments/environment.ts`, con la URL de la API. Lo usan
  los servicios (y sus tests):

  ```ts
  private baseUrl = `${environment.apiUrl}/authors`;
  ```

  Si hicieran falta valores distintos para desarrollo y producción, `npx ng generate environments` crea
  un segundo fichero (`environment.development.ts`) y configura en `angular.json` que se cambie uno por
  otro según cómo se compile (`fileReplacements`). Lo dejamos en uno para que sea más sencillo.

## 3. Componentes

Un componente es una clase con `@Component` (el .ts) más su HTML y su CSS. Cada pantalla del backoffice
es un componente (`authors-list`, `author-form`, `books-list`...). Uno de los más sencillos, y el que
mejor enseña los inputs y outputs, es la paginación:

```ts
// src/app/components/pagination/pagination.ts
@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  page = input.required<number>();
  totalPages = input.required<number>();
  pageChange = output<number>();
}
```

- `selector`: la etiqueta con la que se usa (`<app-pagination>`).
- `imports`: los componentes standalone importan directamente lo que usan en su HTML, ya no hacen falta
  los `NgModule`.
- `styleUrl`: su CSS solo afecta a este componente.

La lista (padre) le pasa datos a la paginación (hijo) con `input()`, y el hijo le avisa al padre con
`output()`:

```html
<!-- src/app/components/authors-list/authors-list.html -->
<app-pagination
  [page]="currentPage()"
  [totalPages]="totalPages()"
  (pageChange)="page.set($event)"
/>
```

Es lo mismo que antes se hacía con `@Input()` y `@Output() ... = new EventEmitter()`.

Si el padre y el hijo tienen que compartir un mismo valor en los dos sentidos, se usa `model()`. Es lo que
hace el selector de lista o tarjetas (`view-toggle`): el hijo cambia el modo al pulsar un botón y el
padre se entera solo, con la misma sintaxis `[( )]` que `ngModel`:

```ts
// view-toggle.ts
mode = model<ViewMode>('list');
```

```html
<!-- authors-list.html y books-list.html -->
<app-view-toggle [(mode)]="viewMode" />
```

Cada lista guarda el modo elegido en el navegador (`localStorage`) con un `effect()`, así al volver a la
pantalla sigue igual.

Ciclo de vida: las listas y los formularios piden los datos en `ngOnInit()`, que Angular llama cuando el
componente ya está creado y tiene sus inputs:

```ts
export class AuthorsList implements OnInit {
  ngOnInit(): void {
    this.authorService.getAuthors().subscribe(/* ... */);
  }
}
```

## 4. Servicios e inyección de dependencias

Un servicio es una clase con `@Injectable` para la lógica que no es de pantalla, aquí las llamadas a la
API. Con `providedIn: 'root'` Angular crea una sola instancia (singleton) para toda la app:

```ts
// src/app/services/author.service.ts
@Injectable({ providedIn: 'root' })
export class AuthorService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/authors`;

  getAuthors(): Observable<AuthorListResponse> {
    return this.http.get<AuthorListResponse>(this.baseUrl);
  }
}
```

Los componentes lo piden con `inject()`, sin crearlo ellos:

```ts
private authorService = inject(AuthorService);
```

Antes se hacía por el constructor (`constructor(private authorService: AuthorService) {}`), que sigue
funcionando. `inject()` es la forma moderna.

## 5. Signals

Una signal es un valor que avisa cuando cambia. Angular sabe qué partes de la pantalla dependen de ella
y solo actualiza esas.

```ts
// src/app/components/authors-list/authors-list.ts
authors = signal<Author[]>([]);     // se crea con un valor inicial
this.authors.set(response.authors); // se cambia
this.authors();                     // se lee (en el HTML también: authors())
```

Con `computed()` se crean valores que se recalculan solos. La búsqueda y la paginación están hechas así,
en el navegador, porque la API no pagina:

```ts
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
```

Y para cambiar una lista a partir de su valor anterior está `update()`, que es lo que se usa al borrar:

```ts
this.authors.update((authors) => authors.filter((a) => a._id !== author._id));
```

Por qué aquí son obligatorias: el proyecto es zoneless, no usa `zone.js` (la librería con la que Angular
detectaba antes cualquier cambio). Ahora la pantalla se actualiza cuando cambia una signal o hay un
evento del usuario. Si guardáramos la respuesta de la API en una variable normal, la tabla no se
enteraría de que han llegado los datos.

## 6. Data binding

Los cuatro tipos, con ejemplos del proyecto:

| Tipo | Dirección | Ejemplo | Dónde |
|---|---|---|---|
| Interpolación | TS -> HTML | `{{ author.name }}` | `authors-list.html` |
| Property binding | TS -> HTML | `[disabled]="form.invalid \|\| saving()"` | `author-form.html` |
| Event binding | HTML -> TS | `(click)="deleteAuthor(author)"` | `authors-list.html` |
| Two-way binding | las dos | `[(ngModel)]="search"` | buscador de `authors-list.html` |

El two-way binding es un property binding y un event binding a la vez (`[ ]` + `( )`). En el buscador,
lo que se escribe va a la signal `search` y, si `search` cambia, el input también.

## 7. Directivas y control flow

Desde Angular 17, en vez de las directivas `*ngIf` y `*ngFor` se usa el control flow con `@`. Desde la
versión 20, `*ngIf` y `*ngFor` están marcadas como obsoletas:

```html
<!-- Antes -->
<p *ngIf="loading">Cargando...</p>
<tr *ngFor="let author of authors">...</tr>

<!-- Ahora (authors-list.html) -->
@if (loading()) {
  <p class="muted">Cargando...</p>
} @else if (!error() || authors().length > 0) {
  <table>...</table>
}

@for (author of pageAuthors(); track author._id) {
  <tr>...</tr>
} @empty {
  <tr><td class="empty" colspan="7">...</td></tr>
}
```

- `track` le dice a Angular cómo identificar cada fila, para no repintarlas todas si la lista cambia.
- `@empty` se pinta cuando la lista está vacía. En `books-list.html` también se usa dentro de una celda
  para poner "Sin autores".

Siguen existiendo las directivas de atributo, que cambian cómo se ve un elemento:

```html
<!-- ngStyle: el color de la etiqueta depende del rol -->
<span class="role" [ngStyle]="{ 'background-color': author.role === 'admin' ? '#fde2e1' : '#e3e8fb' }">

<!-- class binding: la fila sale en gris si el autor no está activo -->
<tr [class.inactive]="!author.active">
```

## 8. Pipes

Un pipe transforma un valor solo para mostrarlo, sin cambiar el dato. Se escribe con `|`:

| Pipe | Ejemplo | Resultado |
|---|---|---|
| `date` | `{{ author.birthDate?.slice(0, 10) \| date: 'dd/MM/yyyy' }}` | `29/09/1547` |
| `currency` | `{{ book.price \| currency: 'EUR' }}` | `€19.90` |
| `uppercase` | `{{ author.role \| uppercase }}` | `ADMIN` |
| `languageName` (propio) | `{{ book.language \| languageName }}` | `Castellano` |

Los que llevan `:` reciben parámetros (el formato de la fecha, la moneda...).

El pipe propio se crea con `npx ng generate pipe pipes/language-name`:

```ts
// src/app/pipes/language-name-pipe.ts
@Pipe({
  name: 'languageName',
})
export class LanguageNamePipe implements PipeTransform {
  transform(code: string | undefined): string {
    if (!code) {
      return '';
    }
    return LANGUAGE_NAMES[code] ?? code;
  }
}
```

Curiosidad: a la fecha de nacimiento le pasamos solo el día (`slice(0, 10)`). Si se le pasa la fecha
entera con hora, el pipe la convierte a la hora local, y a Cervantes y a Borges les salía un día menos:
son fechas de antes de 1901, cuando España tenía otra hora oficial.

## 9. Routing

Las rutas están en `src/app/app.routes.ts`. Cada URL tiene su componente:

```ts
export const routes: Routes = [
  { path: '', redirectTo: 'authors', pathMatch: 'full' },
  { path: 'authors', component: AuthorsList, title: 'Autores' },
  { path: 'authors/new', component: AuthorForm, title: 'Nuevo autor' },
  { path: 'authors/:id/edit', component: AuthorForm, title: 'Editar autor' },
  { path: 'books', component: BooksList, title: 'Libros' },
  // ...
  { path: '**', redirectTo: 'authors' },
];
```

- `<router-outlet />` (en `app.html`) es el hueco donde se pinta el componente de la ruta actual.
- `routerLink` navega sin recargar y `routerLinkActive` marca el enlace de la página actual (en
  `navbar.html`).
- `title` cambia el título de la pestaña del navegador.
- Desde el código se navega con el `Router`. Al guardar un formulario se vuelve a la lista con
  `this.router.navigate(['/authors'], { replaceUrl: true })`. El `replaceUrl` hace que el botón Atrás no
  vuelva al formulario que se acaba de guardar.

### Paso de datos entre pantallas

Hay dos formas, y las dos se usan.

La primera es por la URL (`:id`). Con `withComponentInputBinding()` en `app.config.ts`, el parámetro le
llega al componente como un input:

```ts
// author-form.ts
id = input<string>();
```

Sin esa opción, se leería con `ActivatedRoute`:

```ts
const id = inject(ActivatedRoute).snapshot.paramMap.get('id');
```

La segunda es por el `state` de la navegación. El botón "Editar" de la lista de autores manda el autor
entero, que no se ve en la URL:

```ts
// authors-list.ts
this.router.navigate(['/authors', author._id, 'edit'], { state: { author } });
```

Y el formulario lo recoge de `history.state`. Si no está (por ejemplo, si se entra pegando la URL o
desde otra pestaña), lo pide a la API con el id de la URL:

```ts
// author-form.ts
const author: Author | undefined = history.state?.author;
if (author?._id === id) {
  this.fillForm(author);
  return;
}
this.authorService.getAuthor(id).subscribe(/* ... */);
```

Ojo: al recargar con F5 el navegador conserva el `state`, así que no se hace la petición. Para enseñar
el caso de la API hay que pegar la URL de edición en otra pestaña.

En "Editar libro" solo se usa la URL, y el formulario siempre pide el libro a la API.

## 10. HttpClient y Observables

`HttpClient` se activa en `app.config.ts` con `provideHttpClient()` y lo usan los servicios
([apartado 4](#4-servicios-e-inyección-de-dependencias)). Sus métodos devuelven un Observable, y la
petición no se hace hasta que alguien se suscribe:

```ts
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
```

No hace falta desuscribirse, porque el Observable de `HttpClient` se completa solo cuando llega la
respuesta.

Observable frente a Promise:

| | Observable (`subscribe`) | Promise (`then`) |
|---|---|---|
| Cuándo empieza | Al suscribirse (es lazy) | Nada más crearla |
| Valores | Puede emitir varios a lo largo del tiempo | Uno solo |
| Cancelar | Sí (`unsubscribe`) | No |
| Operadores | `map`, `filter`, `switchMap`... | `then`/`catch` |

Si se quiere trabajar con una Promise, se puede convertir:

```ts
const response = await firstValueFrom(this.authorService.getAuthors());
// o bien
firstValueFrom(this.authorService.getAuthors()).then((response) => { /* ... */ });
```

El recorrido de una petición, desde que se entra en Autores hasta MongoDB y vuelta:

```
AuthorsList (ngOnInit)
  -> AuthorService.getAuthors()
    -> HttpClient: GET http://localhost:1337/authors
      -> API (backend): router -> middleware -> controller -> service -> model
        -> MongoDB
      <- { authors: [...] }
  <- subscribe -> this.authors.set(...) -> la tabla se actualiza (signal)
```

Los errores también vuelven por el mismo camino. `utils/api-error.ts` los pasa a un texto: si la API no
responde (`status 0`) avisa de que hay que arrancar el backend, y si responde con error enseña su
`message` (por ejemplo, "email ya existe" con un 409).

## 11. Formularios

Angular tiene dos formas de hacer formularios, y el proyecto usa las dos.

### Template-driven (FormsModule)

Todo se hace desde el HTML con `ngModel`. Va bien para cosas pequeñas, como el buscador:

```html
<input [(ngModel)]="search" (ngModelChange)="page.set(1)" />
```

### Reactivos (ReactiveFormsModule)

El formulario se define en el TS con sus validadores. Es lo que usan `author-form` y `book-form`:

```ts
// author-form.ts
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
```

```html
<!-- author-form.html -->
<form [formGroup]="form" (ngSubmit)="save()">
  <input type="text" formControlName="name" />
  @if (form.controls.name.touched && form.controls.name.invalid) {
    <small class="field-error">El nombre es obligatorio</small>
  }
  ...
  <button type="submit" [disabled]="form.invalid || saving()">...</button>
</form>
```

- Los mensajes salen cuando el campo está `touched` (se ha tocado) y es `invalid`.
- Angular añade clases como `ng-invalid` y `ng-touched` a los inputs. En `styles.css` las usamos para
  poner el borde en rojo.
- El `<select multiple>` de autores de `book-form` guarda una lista de ids, y `Validators.required`
  obliga a elegir al menos uno.

Los validadores de Angular son parecidos a los de Joi en el backend. Así casi todos los errores salen
antes de enviar, pero la API lo vuelve a validar igualmente. Un email repetido, por ejemplo, solo lo sabe
la API, y el formulario enseña su mensaje.

Antes de enviar, `utils/remove-empty.ts` quita los campos vacíos, porque Joi responde 422 si le llega un
`""` o un `null`:

```ts
const author = removeEmpty(this.form.getRawValue()) as CreateAuthor;
```

## 12. Depurar con Angular DevTools

[Angular DevTools](https://angular.dev/tools/devtools) es una extensión de Chrome y Firefox. Solo
funciona con la app en modo desarrollo (`npm start`, no con el build de producción) y aparece como una
pestaña más de F12:

- Components: el árbol de componentes (`App`, `Navbar`, `AuthorsList` con su `Pagination`...). Al
  elegir uno se ven sus propiedades y el valor de sus signals en ese momento, y se pueden cambiar a mano
  para probar.
- Profiler: graba qué componentes se actualizan y cuánto tardan.
- Injector tree: enseña dónde está cada servicio. Se ve que `AuthorService` está una sola vez, en el
  inyector raíz: es el singleton del [apartado 4](#4-servicios-e-inyección-de-dependencias).
- Router tree: las rutas de `app.routes.ts`.

En VS Code, además, la configuración "ng serve" de `.vscode/launch.json` abre Chrome con el depurador
enganchado, y así se pueden poner breakpoints en los `.ts` (F5).

Los tests se pasan con `npm test -- --watch=false` (Vitest): comprueban los servicios, el pipe y que
la app arranca con su menú.
