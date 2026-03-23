import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('Autenticación', () => {
  test('muestra formulario de login', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.getByPlaceholder('tu@correo.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
  });

  test('login con credenciales inválidas muestra error', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('tu@correo.com').fill('noexiste@test.com');
    await page.getByPlaceholder('••••••••').fill('wrongpass');
    await page.getByText('Entrar →').click();
    await expect(page.getByText('Credenciales inválidas')).toBeVisible();
  });

  test('login exitoso redirige al inicio', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('tu@correo.com').fill('juan@test.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByText('Entrar →').click();
    await expect(page).toHaveURL(`${BASE}/`);
  });
});

test.describe('Inicio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('tu@correo.com').fill('juan@test.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByText('Entrar →').click();
    await page.waitForURL(`${BASE}/`);
  });

  test('muestra botones de examen', async ({ page }) => {
    await expect(page.getByText('Usar preguntas existentes')).toBeVisible();
  });

  test('admin ve panel de administración', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('tu@correo.com').fill('yo@yo');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByText('Entrar →').click();
    await page.waitForURL(`${BASE}/`);
    await expect(page.locator('button', { hasText: /admin/i }).or(page.locator('button', { hasText: /administra/i }))).toBeVisible();
  });
});

test.describe('Examen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('tu@correo.com').fill('juan@test.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByText('Entrar →').click();
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
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('tu@correo.com').fill('yo@yo');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByText('Entrar →').click();
    await page.waitForURL(`${BASE}/`);
    await page.goto(`${BASE}/admin`);
  });

  test('muestra lista de preguntas', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Preguntas/ })).toBeVisible();
  });

  test('puede crear una nueva pregunta', async ({ page }) => {
    await page.getByText('+ Nueva pregunta').click();
    await page.getByPlaceholder('ej. Historia de México').fill('Prueba Playwright');
    await page.getByPlaceholder('Escribe la pregunta aquí...').fill('¿Pregunta de prueba Playwright?');
    await page.getByPlaceholder('Opción 1').fill('Sí');
    await page.getByPlaceholder('Opción 2').fill('No');
    await page.getByPlaceholder('Opción 3').fill('Tal vez');
    await page.getByPlaceholder('Opción 4').fill('Ninguna');
    await page.getByText('Guardar').click();
    await expect(page.getByText('¿Pregunta de prueba Playwright?').first()).toBeVisible();
  });

  test('puede ver usuarios', async ({ page }) => {
    await page.getByRole('button', { name: /Usuarios/ }).click();
    await expect(page.locator('p', { hasText: 'juan@test.com' })).toBeVisible();
  });
});
