process.env.JWT_SECRET = 'clave_test_123456789';

import { generarToken, verificarToken } from '../lib/auth';

describe('JWT - generarToken', () => {
  test('genera un token string no vacío', () => {
    const token = generarToken({ id: 1, email: 'test@test.com' });
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('el token tiene 3 partes separadas por puntos', () => {
    const token = generarToken({ id: 1, email: 'test@test.com' });
    const partes = token.split('.');
    expect(partes).toHaveLength(3);
  });
});

describe('JWT - verificarToken', () => {
  test('verifica correctamente un token generado', () => {
    const payload = { id: 42, email: 'usuario@test.com' };
    const token = generarToken(payload);
    const resultado = verificarToken(token);
    expect(resultado.id).toBe(42);
    expect(resultado.email).toBe('usuario@test.com');
  });

  test('lanza error con token inválido', () => {
    expect(() => verificarToken('token.falso.aqui')).toThrow();
  });

  test('lanza error con token vacío', () => {
    expect(() => verificarToken('')).toThrow();
  });
});
