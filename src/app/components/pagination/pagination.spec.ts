import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pagination } from './pagination';

describe('Pagination', () => {
  let fixture: ComponentFixture<Pagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagination],
    }).compileComponents();

    fixture = TestBed.createComponent(Pagination);
  });

  // Le doy los inputs como lo haría el listado y devuelvo los dos botones
  async function render(page: number, totalPages: number) {
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('totalPages', totalPages);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const [previous, next] = Array.from(element.querySelectorAll('button'));
    return { element, previous, next };
  }

  it('muestra la página actual y el total', async () => {
    const { element } = await render(2, 3);
    expect(element.textContent).toContain('Página 2 de 3');
  });

  it('desactiva Anterior en la primera página y Siguiente en la última', async () => {
    const first = await render(1, 3);
    expect(first.previous.disabled).toBe(true);
    expect(first.next.disabled).toBe(false);

    const last = await render(3, 3);
    expect(last.previous.disabled).toBe(false);
    expect(last.next.disabled).toBe(true);
  });

  it('avisa al padre con la página a la que hay que ir', async () => {
    const { previous, next } = await render(2, 3);
    const pages: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => pages.push(page));

    next.click();
    previous.click();

    expect(pages).toEqual([3, 1]);
  });
});
