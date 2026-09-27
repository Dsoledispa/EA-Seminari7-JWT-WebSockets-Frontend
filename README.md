# BackOWIAffice — Autores y libros

Backoffice hecho con Angular 21 (TypeScript, RxJS y Vitest para los tests) para el Seminario 6 de EA.
Es el frontend de la API REST del Seminario 5
([EA-Seminari5-APIambExpress](https://github.com/Martatm18/EA-Seminari5-APIambExpress)): desde aquí se
pueden listar, buscar, crear, editar y borrar autores y libros.

La explicación de cómo funciona por dentro (componentes, servicios, signals, routing, formularios...)
está en [GUIA.md](GUIA.md).

## Requisitos

- [Node.js](https://nodejs.org/) 22.12 o superior (el backend del S5 recomienda Node 24 LTS).
- [MongoDB](https://www.mongodb.com/), local o en Atlas, para el backend.
- El backend del Seminario 5 arrancado (ver abajo).
- Recomendado: VS Code con la extensión *Angular Language Service* y [Angular DevTools](https://angular.dev/tools/devtools) en el navegador.

## Cómo arrancarlo

Hacen falta dos terminales: una para la API y otra para Angular.

**1. Backend (Seminario 5)**

Con MongoDB ya arrancado (o con la URL de Atlas puesta en el `.env`):

```
git clone https://github.com/Martatm18/EA-Seminari5-APIambExpress
cd EA-Seminari5-APIambExpress
npm install
cp .env.example .env
npm run seed
npm run dev
```

La API queda en http://localhost:1337 y su documentación (Swagger) en http://localhost:1337/api-docs.
`npm run seed` mete 5 autores y 12 libros de ejemplo; con `npm run seed -- --reset` se vuelven a poner
desde cero. Todos los autores de ejemplo tienen la contraseña `seminari5`.

**2. Frontend (este repo)**

```
git clone https://github.com/mbakkali28/EA-Seminari6-Angular-BackOffice
cd EA-Seminari6-Angular-BackOffice
npm install
npm start
```

Y se abre http://localhost:4200.

## Configuración: un solo fichero

Solo hay **un** fichero de configuración. Para cambiar la dirección de la API se toca aquí y en ningún
sitio más:

```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:1337'
};
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo en http://localhost:4200. Se recarga solo al guardar |
| `npm test` | Pasa los tests con Vitest y se queda esperando cambios (`npm test -- --watch=false` para pasarlos una vez) |
| `npm run build` | Compila la versión de producción en `dist/backoffice/browser` |
| `npx ng generate component components/<nombre>` | Crea un componente nuevo con el CLI del proyecto |

## Pantallas

| Ruta | Pantalla |
|---|---|
| `/authors` | Lista de autores: buscador, paginación, editar y borrar |
| `/authors/new` | Nuevo autor |
| `/authors/:id/edit` | Editar autor |
| `/books` | Lista de libros: buscador, paginación, editar y borrar |
| `/books/new` | Nuevo libro |
| `/books/:id/edit` | Editar libro |

## Estructura del proyecto

```
src/app/
├── components/
│   ├── navbar/            # menú de arriba
│   ├── authors-list/      # lista de autores
│   ├── author-form/       # crear y editar autores
│   ├── books-list/        # lista de libros
│   ├── book-form/         # crear y editar libros
│   └── pagination/        # paginación, componente hijo de las dos listas
├── models/
│   ├── author.model.ts    # Author, CreateAuthor, UpdateAuthor
│   ├── book.model.ts      # Book, BookInput, CreateBook, UpdateBook, BOOK_LANGUAGES, BOOK_TAGS
│   └── index.ts
├── services/
│   ├── author.service.ts  # getAuthors, getAuthor, createAuthor, updateAuthor, deleteAuthor
│   └── book.service.ts    # getBooks, getBook, createBook, updateBook, deleteBook
├── pipes/
│   └── language-name-pipe.ts   # 'es' -> 'Castellano'
├── utils/
│   ├── api-error.ts       # pasa un error de HttpClient a un texto para la pantalla
│   └── remove-empty.ts    # quita los campos vacíos antes de enviar un formulario
├── app.routes.ts          # rutas
└── app.config.ts          # router y HttpClient
```

## Cosas de la API que hay que saber

- Editar es un PUT y la API pide siempre los campos obligatorios. En los autores eso incluye la
  contraseña: al editar hay que escribirla otra vez y se guarda la que se escriba.
- Un campo opcional que se deja vacío al editar no se borra. La API rechaza los valores vacíos, así
  que el formulario no los envía y la API deja el valor que tenía. Los tags sí se pueden vaciar: si se
  desmarcan todos se envía una lista vacía.
- Borrar un autor no borra sus libros: se quedan sin ese autor (si era el único, en la lista sale
  "Sin autores").
- Los mensajes de error de validación que devuelve la API (422) vienen en inglés, de Joi.
