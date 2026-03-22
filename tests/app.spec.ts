import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('Autenticación', () => {
  test('muestra formulario de login', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Contraseña')).toBeVisible();
  });

  test('login con credenciales inválidas muestra error', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('Email').fill('noexiste@test.com');
    await page.getByPlaceholder('Contraseña').fill('wrongpass');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Credenciales inválidas')).toBeVisible();
  });

  test('login exitoso redirige al inicio', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('Email').fill('juan@test.com');
    await page.getByPlaceholder('Contraseña').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(`${BASE}/`);
    await expect(page.getByText('Hola, Juan')).toBeVisible();
  });
});

test.describe('Inicio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('Email').fill('juan@test.com');
    await page.getByPlaceholder('Contraseña').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(`${BASE}/`);
  });

  test('muestra botones de examen', async ({ page }) => {
    await expect(page.getByText('Generar con IA')).toBeVisible();
    await expect(page.getByText('Usar preguntas existentes')).toBeVisible();
  });

  test('admin ve panel de administración', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('Email').fill('yo@yo');
    await page.getByPlaceholder('Contraseña').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(`${BASE}/`);
    await expect(page.getByText('Panel de administración')).toBeVisible();
  });
});

test.describe('Examen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('Email').fill('juan@test.com');
    await page.getByPlaceholder('Contraseña').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(`${BASE}/`);
  });

  test('puede iniciar examen con preguntas existentes', async ({ page }) => {
    await page.getByText('Usar preguntas existentes').click();
    await expect(page).toHaveURL(`${BASE}/examen`);
    await expect(page.getByText('Pregunta 1')).toBeVisible();
  });

  test('puede completar examen y ver resultado', async ({ page }) => {
    await page.getByText('Usar preguntas existentes').click();
    await page.waitForURL(`${BASE}/examen`);
    while (page.url().includes('/examen')) {
      await page.getByRole('button').first().click();
      await page.waitForTimeout(600);
    }
    await expect(page).toHaveURL(`${BASE}/resultado`);
    await expect(page.getByText('Resultado')).toBeVisible();
  });
});

test.describe('Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('Email').fill('yo@yo');
    await page.getByPlaceholder('Contraseña').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(`${BASE}/`);
    await page.goto(`${BASE}/admin`);
  });

  test('muestra lista de preguntas', async ({ page }) => {
    await expect(page.getByText('Preguntas')).toBeVisible();
  });

  test('puede crear una nueva pregunta', async ({ page }) => {
    await page.getByText('+ Nueva pregunta').click();
    await page.getByPlaceholder('Tema').fill('Prueba Playwright');
    await page.getByPlaceholder('Enunciado').fill('¿Esta es una pregunta de prueba?');
    await page.getByPlaceholder('Opción 1').fill('Sí');
    await page.getByPlaceholder('Opción 2').fill('No');
    await page.getByPlaceholder('Opción 3').fill('Tal vez');
    await page.getByPlaceholder('Opción 4').fill('Ninguna');
    await page.getByText('Guardar pregunta').click();
    await expect(page.locator('strong', { hasText: '¿Esta es una pregunta de prueba?' }).first()).toBeVisible();
  });

  test('puede ver usuarios', async ({ page }) => {
    await page.getByRole('button', { name: /Usuarios/ }).click();
    await expect(page.getByText('Juan')).toBeVisible();
  });

  /* PRUEBA GEMINI - comentada hasta tener API key válida
  test('puede generar preguntas con IA', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.getByPlaceholder('Tema').fill('Historia de México');
    await page.getByText('Generar con IA').click();
    await page.waitForURL(`${BASE}/examen`, { timeout: 30000 });
    await expect(page.getByText('Pregunta 1')).toBeVisible();
  });
  */
});
