# LOGS

Bitácora del frontend del Seminario 7. Tiene dos partes:

- **Tareas**: lo que hay que hacer en este repositorio, por bloques. Quien coge una tarea la marca al
  cerrarla.
- **Bitácora**: lo que se ha hecho, las decisiones tomadas y qué prompts de IA se han usado.

Las tareas del backend están en el LOGS.md de
[EA-Seminari7-JWT-WebSockets-Backend](https://github.com/Dsoledispa/EA-Seminari7-JWT-WebSockets-Backend).

## Contrato

Lo que backend y frontend tienen que cumplir igual. Si algo de aquí cambia, se cambia en los dos
LOGS.md.

- **Rutas públicas**: `POST /auth/register` y `POST /auth/login`. `POST /auth/refresh` se autentica con
  su propio refresh token. Todo lo demás exige token.
- **Registro**: responde 201 con el usuario y **sin token**. El frontend redirige entonces a la página
  de login.
- **Login**: el cuerpo es `{ email, password }`. Responde `{ token, user }` o 401.
- **Token**: se envía en la cabecera `Authorization: Bearer <token>`. Su payload lleva los claims `sub`
  (id del usuario), `role` y `exp`.
- **Roles**: el CRUD del backoffice (autores y libros) es solo para `admin`. El chat es para todos los
  usuarios con sesión iniciada.
- **Modelos**: `users`, `authors` y `books`. La autenticación vive solo en `User`: los campos
  `password` y `role` que `Author` traía del Seminario 5 se eliminan.
- **Paginación**: `GET /authors?page=&limit=` y `GET /books?page=&limit=`, por defecto `page=1` y
  `limit=5`. Responden `{ authors, total, page, pages }` y `{ books, total, page, pages }`.
- **Autores borrados**: un autor borrado (borrado lógico) sigue apareciendo dentro de sus libros.
- **Chat** (extra): por concretar al empezar el bloque B del backend: los payloads de `chat:join` y
  `chat:message`, la forma del mensaje que emite el servidor (usuario, texto, fecha), cómo llega el
  historial al entrar y cómo se llama la sala de un chat directo.

## Tareas

### Estructura

- [ ] `structure`: ramas `develop` y de objetivo, identidad del repositorio (nombre, README con el
  stack tecnológico), CONTRIBUTING.md, este LOGS.md y angular-eslint
- [x] Resolver los 5 errores que angular-eslint encuentra en el código heredado del S6 (ver la
  bitácora)

### Bloque D: autenticación en Angular

- [ ] Pantallas de registro y de login con formularios reactivos y validación; al registrarse se
  redirige a la página de login
- [ ] Quitar de los formularios y modelos de autor los campos `password` y `role` cuando el backend
  los elimine (contrato)
- [ ] `AuthService`: register, login, logout, guardar el token (y documentar por qué localStorage o
  cookie HttpOnly, con los riesgos de cada una) y el usuario con sesión en una signal
- [ ] Interceptor HTTP: añade `Authorization: Bearer` a cada petición; si llega un 401, limpia la sesión
  y lleva al login (o renueva el token con el refresh, si da tiempo)
- [ ] Guard `CanActivate` en las rutas protegidas; enseñar u ocultar acciones según el rol

### Bloque E: chat (extra)

Extra: el profesor lo marcó como no prioritario y seguramente no entra en la demo. Es la pareja del
bloque B del backend. Se mantiene simple: lo importante es poder explicar el flujo de un mensaje.

- [ ] Servicio que encapsula `socket.io-client` y se conecta enviando el token
- [ ] Los eventos del socket expuestos como Observables
- [ ] Componente de chat con los tres niveles: general, salas de grupo y directo (eligiendo el
  usuario); historial al entrar, lista de mensajes, envío y estado de la conexión
- [ ] Limpieza en `OnDestroy` (unsubscribe y desconexión) para no dejar conexiones duplicadas
- [ ] URL del servidor de sockets en `environments`

### Bloque F: usar la paginación del servidor

- [x] Adaptar los services a la nueva forma de la respuesta de los listados
- [ ] Las listas piden cada página a la API en lugar de trocear la lista en memoria; el componente
  `app-pagination` se reutiliza tal cual
- [ ] Hacer que el buscador funcione junto con la paginación

### Extra opcional

- [ ] Que el rol `user` pueda ver la lista de libros (solo lectura), para que tenga algo más que el
  chat. Va después del bloque D y necesita su pareja en el backend

## Bitácora

### 2026-10-03 · Punto de partida y `structure`

- El repositorio nace como copia del frontend del Seminario 6, que ya cubría CRUD contra la API,
  formularios reactivos, validación y routing (explicado en GUIA.md).
- Se crea `develop` como rama de integración; `main` queda para presentar.
- Identidad: el paquete pasa a llamarse `ea-seminari7-jwt-websockets-frontend` y el README se reescribe
  con el stack tecnológico. El nombre interno del proyecto en `angular.json` sigue siendo `backoffice`:
  es un identificador del CLI ligado a la carpeta de salida (`dist/backoffice`) y cambiarlo no aporta
  nada.
- El `.gitignore` heredado ignoraba todos los `.md` salvo README, GUIA y EJERCICIO (reglas de notas
  personales). Se quita esa regla para que CONTRIBUTING.md y LOGS.md entren en el repositorio. Se borra
  `src/.gitigonore`, un fichero vacío con el nombre mal escrito.
- Textos que describían el borrado antiguo (el modal de borrar autor y el README decían que los libros
  se quedaban sin el autor): ahora dicen que el autor sigue apareciendo en sus libros, que es lo que
  hace el backend con el borrado lógico.
- Linter: se añade angular-eslint 21 (la versión 22 es para Angular 22; `ng add` instala la última por
  defecto y hay que fijar la 21). Comparado con Oxlint en el backend: Oxlint es mucho más rápido y no
  pide configuración, pero solo mira TypeScript; angular-eslint también revisa las plantillas HTML con
  reglas de Angular y de accesibilidad. En el código heredado encuentra 5 errores que Oxlint no habría
  visto:
  - `author-form.ts`: la variable `confirmPassword` se saca del formulario para no enviarla, pero no se
    usa, y la regla `no-unused-vars` lo marca.
  - `confirm-modal.html` (4 errores): el fondo y la ventana del modal escuchan `(click)` sin ser
    elementos con foco ni tener evento de teclado, así que con el teclado no se puede cerrar el modal
    pulsando fuera.
- Tests: 7 ficheros y 20 tests, todos en verde.


### 2026-10-04 · Corrección de errores de angular-eslint

- En `author-form.ts`, el payload ahora incluye explícitamente los campos del autor y omite `confirmPassword`.
- En `confirm-modal.html`, el fondo y la ventana responden a Escape; la ventana se identifica como diálogo modal accesible y el clic interior no se propaga al fondo.
- Verificación: `npx ng lint` sin errores y `npx ng test` con 20 tests en verde.

### 2026-10-04 · Adaptación de los services a la paginación

- Los services de autores y libros aceptan `page` y `limit` y tipan la respuesta paginada con `AuthorsPage` y `BooksPage`. El selector de autores del formulario de libros pide hasta 100.
- Verificación: `npx ng lint` sin errores y `npx ng test` con 22 tests en verde.

