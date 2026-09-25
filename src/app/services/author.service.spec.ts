import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Author } from '../models';
import { AuthorService } from './author.service';

describe('AuthorService', () => {
  let service: AuthorService;
  let httpMock: HttpTestingController;

  const author: Author = {
    _id: 'a1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    nationality: 'British',
    active: true,
    role: 'admin',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAuthors() returns the raw { authors } response', () => {
    let response: Author[] | undefined;
    service.getAuthors().subscribe((res) => (response = res.authors));

    const req = httpMock.expectOne('http://localhost:1337/authors');
    expect(req.request.method).toBe('GET');
    req.flush({ authors: [author] });

    expect(response).toEqual([author]);
  });

  it('getAuthor() returns the raw { author } response', () => {
    let response: Author | undefined;
    service.getAuthor('a1').subscribe((res) => (response = res.author));
    httpMock.expectOne('http://localhost:1337/authors/a1').flush({ author });

    expect(response).toEqual(author);
  });

  it('createAuthor() posts the payload', () => {
    service
      .createAuthor({
        name: 'A',
        email: 'a@b.c',
        nationality: 'X',
        password: 'seminari5',
        role: 'admin',
      })
      .subscribe();
    const req = httpMock.expectOne('http://localhost:1337/authors');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.password).toBe('seminari5');
    req.flush({ author });
  });

  it('updateAuthor() puts the payload to the id url', () => {
    service.updateAuthor('a1', { nationality: 'English' }).subscribe();
    const req = httpMock.expectOne('http://localhost:1337/authors/a1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.nationality).toBe('English');
    req.flush({ author: { ...author, nationality: 'English' } });
  });

  it('deleteAuthor() sends a DELETE to the id url', () => {
    service.deleteAuthor('a1').subscribe();
    const req = httpMock.expectOne('http://localhost:1337/authors/a1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('propagates the server error to the subscriber', () => {
    let failed = false;
    service.getAuthors().subscribe({ error: () => (failed = true) });
    httpMock
      .expectOne('http://localhost:1337/authors')
      .flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
  });
});
