# Seminari 7: frontend Angular con JWT y WebSockets

Backoffice en Angular para gestionar **autores** y **libros**: desde aquí se pueden listar, buscar,
crear, editar y borrar. Es el frontend del Seminario 7 de EA:

> Backend/Frontend: JWT, WebSockets. Backend TS + Express. Frontend Angular.

Este repositorio parte del frontend del Seminario 6, que ya cubría consumir una API REST (CRUD),
formularios reactivos, validación y routing. Sobre esa base, el equipo añade en este seminario:

- Registro y login, con el token JWT guardado, un interceptor que lo envía y guards en las rutas
- Listados paginados por el servidor
- Extra: chat en tiempo real con socket.io (general, de grupo y directo)

Consume la API de [EA-Seminari7-JWT-WebSockets-Backend](https://github.com/Dsoledispa/EA-Seminari7-JWT-WebSockets-Backend).

Cómo funciona por dentro (componentes, servicios, signals, routing, formularios...): [GUIA.md](GUIA.md).
Las tareas y la bitácora del seminario: [LOGS.md](LOGS.md). Cómo trabajamos (ramas, commits, pull
requests): [CONTRIBUTING.md](CONTRIBUTING.md).

## Stack tecnológico

Lo que ya está instalado y funcionando:

| Tecnología | Versión | Para qué se usa |
|---|---|---|
| [Angular](https://angular.dev/) | 21.2 | Framework del frontend: componentes, router, formularios y cliente HTTP, todo oficial |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | JavaScript con tipos. Angular fija qué versiones admite, por eso no va en la 6.0 como el backend |
| [RxJS](https://rxjs.dev/) | 7.8 | Observables: lo que devuelve `HttpClient` y a lo que se hace `subscribe` |
| [Angular CLI](https://angular.dev/tools/cli) | 21.2 | El comando `ng`: servidor de desarrollo, build, tests, lint y generar componentes |
| [Vitest](https://vitest.dev/) | 4.1 | Ejecuta los tests (`*.spec.ts`). Es el runner por defecto de Angular desde que Karma quedó obsoleto |
| [jsdom](https://github.com/jsdom/jsdom) | 28.1 | Simula el navegador dentro de Node para que los tests puedan pintar componentes |
| [ESLint](https://eslint.org/) + [angular-eslint](https://github.com/angular-eslint/angular-eslint) | 10.12 / 21.4 | Linter: analiza el TypeScript y también las plantillas HTML, con reglas propias de Angular y de accesibilidad |
| [Prettier](https://prettier.io/) | 3.9 | Da formato al código (reglas en `.prettierrc`, con el parser de Angular para los `.html`) |

Lo que se añadirá durante el seminario (todavía **no** está instalado):

| Tecnología | Para qué se usará |
|---|---|
| [socket.io-client](https://socket.io/docs/v4/client-api/) | Cliente de WebSockets del chat, encapsulado en un servicio de Angular |

El token JWT no necesita librería: el interceptor y el guard se hacen con lo que ya trae Angular.

## Requisitos previos

- [Node.js](https://nodejs.org/) 24 LTS (mínimo 22.12, que es lo que exige Angular 21). Incluye
  [npm](https://www.npmjs.com/).
- El backend del Seminario 7 arrancado, con su MongoDB (ver abajo).
- [VS Code](https://code.visualstudio.com/) con la extensión *Angular Language Service* (recomendado) y
  [Angular DevTools](https://angular.dev/tools/devtools) en el navegador.

Angular CLI no hace falta instalarlo aparte: viene con las dependencias del proyecto (`npx ng ...`).

## Cómo arrancarlo

Hacen falta dos terminales: una para la API y otra para Angular.

**1. Backend**

Con MongoDB ya arrancado (o con la URL de Atlas puesta en el `.env`):

```
git clone https://github.com/Dsoledispa/EA-Seminari7-JWT-WebSockets-Backend
cd EA-Seminari7-JWT-WebSockets-Backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

La API queda en http://localhost:1337 y su documentación (Swagger) en http://localhost:1337/api-docs.
`npm run seed` mete 5 autores y 12 libros de ejemplo; con `npm run seed -- --reset` se vuelven a poner
desde cero.

**2. Frontend (este repo)**

```
git clone https://github.com/Dsoledispa/EA-Seminari7-JWT-WebSockets-Frontend
cd EA-Seminari7-JWT-WebSockets-Frontend
npm install
npm start
```

Y se abre http://localhost:4200. La página se recarga sola cada vez que guardas un archivo.

## Configuración: un solo fichero

El frontend no usa `.env`: lo que llega al navegador lo puede leer cualquiera, así que aquí no hay
secretos. Toda la configuración está en **un** fichero, y para cambiar la dirección de la API se toca
aquí y en ningún sitio más:

```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:1337'
};
```

Cuando llegue el chat, la dirección del servidor de sockets también irá aquí.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo en http://localhost:4200. Se recarga solo al guardar |
| `npm test` | Pasa los tests con Vitest y se queda esperando cambios (`npm test -- --watch=false` para pasarlos una vez) |
| `npm run lint` | Pasa angular-eslint sobre los `.ts` y los `.html` de `src/` |
| `npm run build` | Compila la versión de producción en `dist/backoffice/browser` |
| `npx ng generate component components/<nombre>` | Crea un componente nuevo con el CLI del proyecto |

## Pantallas

| Ruta | Pantalla |
|---|---|
| `/authors` | Lista de autores (en tabla o en tarjetas): buscador, paginación, editar y borrar |
| `/authors/new` | Nuevo autor |
| `/authors/:id/edit` | Editar autor |
| `/books` | Lista de libros (en tabla o en tarjetas): buscador, paginación, editar y borrar |
| `/books/new` | Nuevo libro |
| `/books/:id/edit` | Editar libro |

## Estructura del proyecto

```
src/
  main.ts                  Punto de entrada: arranca Angular sobre <app-root> de index.html
  environments/
    environment.ts         La única configuración: la URL de la API
  app/
    app.config.ts          Providers de toda la app: router y HttpClient
    app.routes.ts          El mapa de rutas: qué URL pinta qué componente
    app.ts, app.html       Componente raíz: la barra de navegación y el <router-outlet>
    components/
      navbar/              Menú de arriba
      authors-list/        Lista de autores
      author-card/         Tarjeta de un autor (componente hijo de la lista)
      author-form/         Crear y editar autores
      books-list/          Lista de libros
      book-form/           Crear y editar libros
      pagination/          Paginación, componente hijo de las dos listas
      confirm-modal/       Ventana para confirmar antes de borrar
      view-toggle/         Botones para ver las listas en tabla o en tarjetas
    models/                Interfaces TypeScript con la forma de los datos de la API
      author.model.ts        Author, CreateAuthor, UpdateAuthor
      book.model.ts          Book, BookInput, CreateBook, UpdateBook, BOOK_LANGUAGES, BOOK_TAGS
    services/              Las únicas piezas que hablan con la API (HttpClient)
      author.service.ts      getAuthors, getAuthor, createAuthor, updateAuthor, deleteAuthor
      book.service.ts        getBooks, getBook, createBook, updateBook, deleteBook
    pipes/                 Formatean datos en la plantilla
      language-name-pipe.ts  'es' -> 'Castellano'
      truncate-pipe.ts       Corta textos largos con "..."
    utils/
      api-error.ts         Pasa un error de HttpClient a un texto para la pantalla
      remove-empty.ts      Quita los campos vacíos antes de enviar un formulario
```

Un dato viaja siempre por el mismo camino, igual que en el backend cada capa hace una sola cosa:

```
componente -> service (HttpClient) -> API -> respuesta -> subscribe -> signal -> la plantilla se repinta
```

Los componentes no saben de URLs ni de HTTP: piden los datos al service y guardan el resultado en una
signal.

## Cosas de la API que hay que saber

- Editar es un PUT y la API pide siempre los campos obligatorios. En los autores eso incluye la
  contraseña: al editar hay que escribirla otra vez y se guarda la que se escriba.
- Un campo opcional que se deja vacío al editar no se borra. La API rechaza los valores vacíos, así
  que el formulario no los envía y la API deja el valor que tenía. Los tags sí se pueden vaciar: si se
  desmarcan todos se envía una lista vacía.
- Borrar es un borrado lógico: la API marca el autor o el libro como borrado y deja de devolverlo, pero
  sigue en la base de datos. Por eso un autor borrado **sigue apareciendo dentro de sus libros**.
- Los mensajes de error de validación que devuelve la API (422) vienen en inglés, de Joi.

## Cómo contribuir

Ramas, commits y pull requests en [CONTRIBUTING.md](CONTRIBUTING.md). Tareas pendientes y bitácora en
[LOGS.md](LOGS.md).
