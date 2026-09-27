import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthorsList } from './authors-list';

describe('AuthorsList', () => {
  let component: AuthorsList;
  let fixture: ComponentFixture<AuthorsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorsList],
      // El componente usa AuthorService (necesita HttpClient) y el router
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
