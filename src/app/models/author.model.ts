export type AuthorRole = 'author' | 'admin';

export interface Author {
  _id: string;
  name: string;
  email: string;
  nationality?: string;
  biography?: string;
  birthDate?: string;
  website?: string;
  photoUrl?: string;
  active?: boolean;
  role?: AuthorRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthorsPage {
  authors: Author[];
  total: number;
  page: number;
  pages: number;
}

export type CreateAuthor = Omit<Author, '_id' | 'createdAt' | 'updatedAt'> & {
  password?: string;
};

export type UpdateAuthor = Partial<CreateAuthor>;
