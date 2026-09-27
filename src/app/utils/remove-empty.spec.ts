import { removeEmpty } from './remove-empty';

describe('removeEmpty', () => {
  it('quita los textos vacíos, los null y los undefined', () => {
    const data = { name: 'Ana', nationality: '', pages: null, website: undefined };
    expect(removeEmpty(data)).toEqual({ name: 'Ana' });
  });

  it('quita los textos que solo tienen espacios', () => {
    expect(removeEmpty({ name: 'Ana', isbn: '   ' })).toEqual({ name: 'Ana' });
  });

  it('no toca el resto de valores (ni los espacios de una contraseña)', () => {
    const data = { password: ' clave con espacios ', active: false, price: 0, tags: [] };
    expect(removeEmpty(data)).toEqual(data);
  });
});
