# BackOWIAffice — Authors & Books

##  Environments — the ONE file to configure

There is **only one** settings file. Change the API address here and nothing else:

```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:1337'
};
```

---

## Project structure

```
src/app/
├── models/                 #
│   ├── author.model.ts     #   Author, CreateAuthor, UpdateAuthor
│   ├── book.model.ts       #   Book, BookInput, CreateBook, UpdateBook
│   └── index.ts            #
├── services/               #
│   ├── author.service.ts   #   getAuthors, getAuthor, createAuthor, updateAuthor, deleteAuthor
│   └── book.service.ts     #   getBooks, getBook, createBook, updateBook, deleteBook
├── components/             # the components
└── app.routes.ts           # URL routes
```
