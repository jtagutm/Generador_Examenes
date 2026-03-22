function calcularPuntaje(resultados: { correcto: number }[]): number {
  return resultados.filter(r => r.correcto === 1).length;
}

function calcularPorcentaje(correctas: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correctas / total) * 100);
}

describe('calcularPuntaje', () => {
  test('cuenta correctamente las respuestas correctas', () => {
    const resultados = [{ correcto: 1 }, { correcto: 0 }, { correcto: 1 }, { correcto: 1 }];
    expect(calcularPuntaje(resultados)).toBe(3);
  });

  test('retorna 0 si todas son incorrectas', () => {
    const resultados = [{ correcto: 0 }, { correcto: 0 }];
    expect(calcularPuntaje(resultados)).toBe(0);
  });

  test('retorna el total si todas son correctas', () => {
    const resultados = [{ correcto: 1 }, { correcto: 1 }, { correcto: 1 }];
    expect(calcularPuntaje(resultados)).toBe(3);
  });

  test('maneja array vacío', () => {
    expect(calcularPuntaje([])).toBe(0);
  });
});

describe('calcularPorcentaje', () => {
  test('calcula porcentaje correctamente', () => {
    expect(calcularPorcentaje(3, 5)).toBe(60);
  });

  test('retorna 100 si todo correcto', () => {
    expect(calcularPorcentaje(5, 5)).toBe(100);
  });

  test('retorna 0 si ninguna correcta', () => {
    expect(calcularPorcentaje(0, 5)).toBe(0);
  });

  test('no divide entre cero', () => {
    expect(calcularPorcentaje(0, 0)).toBe(0);
  });
});
