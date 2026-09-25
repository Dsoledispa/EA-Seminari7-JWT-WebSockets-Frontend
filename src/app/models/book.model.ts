import type { Author } from './author.model';

export type BookLanguage = 'es' | 'ca' | 'en';

export interface BookInput {
  title: string;
  isbn: string;
  authors: string[];
  edition?: number;
  publisher?: string;
  publishedYear?: number;
  pages?: number;
  language?: BookLanguage;
  tags?: string[];
  price?: number;
}

export interface Book extends Omit<BookInput, 'authors'> {
  _id: string;
  authors: Author[];
  createdAt?: string;
  updatedAt?: string;
}

export type CreateBook = BookInput;

export type UpdateBook = Partial<BookInput>;
