import { HttpErrorResponse } from '@angular/common/http';

import { apiErrorMessage } from './api-error';

describe('apiErrorMessage', () => {
  it('avisa de que no hay conexión cuando el status es 0', () => {
    const error = new HttpErrorResponse({ status: 0 });
    expect(apiErrorMessage(error)).toBe(
      'No se puede conectar con la API. ¿Está arrancado el backend del S5?',
    );
  });

  it('devuelve el mensaje que manda la API', () => {
    const error = new HttpErrorResponse({ status: 409, error: { message: 'email ya existe' } });
    expect(apiErrorMessage(error)).toBe('email ya existe');
  });

  it('si la API no manda mensaje, enseña el código de error', () => {
    const error = new HttpErrorResponse({ status: 500, error: null });
    expect(apiErrorMessage(error)).toBe('Error 500');
  });
});
