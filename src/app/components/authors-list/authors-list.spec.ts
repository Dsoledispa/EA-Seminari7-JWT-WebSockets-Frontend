import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorsList } from './authors-list';

describe('AuthorsList', () => {
  let component: AuthorsList;
  let fixture: ComponentFixture<AuthorsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorsList],
      // El componente usa AuthorService, que necesita HttpClient
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
