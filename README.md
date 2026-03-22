# Generador de Exámenes

Plataforma web para generar, administrar y responder exámenes usando inteligencia artificial.

---

## Tecnologías

- **Backend:** Next.js 16 (App Router)
- **Base de datos:** SQLite (via Prisma)
- **IA:** Google Gemini API
- **Autenticación:** JWT + bcrypt
- **Frontend:** Next.js + Tailwind CSS
- **Pruebas:** Playwright + Jest

---

## Instalación

### 1. Clonar el repo
```bash
git clone https://github.com/jtagutm/Generador_Examenes.git
cd Generador_Examenes
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Crear archivo `.env.local` en la raíz
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="tu_clave_secreta_larga"
GEMINI_API_KEY="tu_clave_de_gemini"
```

> Para obtener la clave de Gemini: https://aistudio.google.com/app/apikey

### 4. Crear la base de datos
```bash
npx prisma migrate dev
```

### 5. Correr el proyecto
```bash
npm run dev
```

Abre http://localhost:3000

---

## Cuenta de administrador

Regístrate con el email `yo@yo` para tener acceso al panel de administración.

---

## Páginas

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión y registro |
| `/` | Inicio — generar examen o usar preguntas existentes |
| `/examen` | Responder preguntas una por una |
| `/resultado` | Ver puntaje y resumen del examen |
| `/admin` | CRUD de preguntas y vista de usuarios (solo admin) |

---

## API

**URL base:** `http://localhost:3000`

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| POST | /auth/registro | Crear cuenta |
| POST | /auth/entrar | Iniciar sesión |

### Preguntas
| Método | Ruta | Descripción |
|---|---|---|
| GET | /preguntas | Listar todas |
| POST | /preguntas | Crear pregunta |
| PUT | /preguntas/[id] | Editar pregunta y respuestas |
| DELETE | /preguntas/[id] | Eliminar pregunta |
| POST | /preguntas/generar | Generar con Gemini |

### Usuarios
| Método | Ruta | Descripción |
|---|---|---|
| GET | /usuarios | Listar usuarios |
| PUT | /usuarios/[id] | Editar usuario |
| DELETE | /usuarios/[id] | Eliminar usuario |
| POST | /usuarios/[id]/responder | Registrar respuesta |
| GET | /usuarios/[id]/ultimo-examen | Ver último examen |

### Exámenes
| Método | Ruta | Descripción |
|---|---|---|
| POST | /examenes | Crear examen |
| PUT | /examenes/[id]/finalizar | Guardar puntaje final |

---

## Modelo de Base de Datos

**usuarios** — id, nombre, email, contrasena, puntaje_total

**preguntas** — id, tema, enunciado, dificultad

**respuestas** — id, pregunta_id, texto, es_correcta

**intentos** — id, usuario_id, pregunta_id, respuesta_id, examen_id, es_correcto

**examenes** — id, usuario_id, tema, fecha, puntaje, total

---

## Pruebas

### Pruebas unitarias (Jest)

Verifican lógica interna sin necesidad de servidor ni base de datos.

**Correr:**
```bash
npx jest
```

**Pruebas incluidas:**

`__tests__/auth.test.ts` — Pruebas del sistema JWT:
- Genera un token string no vacío
- El token tiene 3 partes separadas por puntos
- Verifica correctamente un token generado
- Lanza error con token inválido
- Lanza error con token vacío

`__tests__/puntaje.test.ts` — Pruebas de lógica de puntaje:
- Cuenta correctamente las respuestas correctas
- Retorna 0 si todas son incorrectas
- Retorna el total si todas son correctas
- Maneja array vacío
- Calcula porcentaje correctamente
- Retorna 100 si todo correcto
- Retorna 0 si ninguna correcta
- No divide entre cero

---

### Pruebas E2E (Playwright)

Simulan un usuario real navegando la aplicación en el navegador.

**Requisito:** tener el servidor corriendo en otra terminal:
```bash
npm run dev
```

**Correr con UI :**
```bash
npx playwright test --ui
```

**Correr en terminal:**
```bash
npx playwright test --headed
```

**Pruebas incluidas:**

`tests/app.spec.ts`:

*Autenticación:*
- Muestra formulario de login
- Login con credenciales inválidas muestra error
- Login exitoso redirige al inicio

*Inicio:*
- Muestra botones de examen
- Admin ve panel de administración

*Examen:*
- Puede iniciar examen con preguntas existentes
- Puede completar examen y ver resultado

*Admin:*
- Muestra lista de preguntas
- Puede crear una nueva pregunta
- Puede ver usuarios

> **Nota:** La prueba de generación con IA está comentada en `tests/app.spec.ts` por falta de cuota para API.

---

## Integrantes

| Nombre | GitHub |
|---|---|
| Samantha Betanzo Bolaños | @sami604 |
| Bryan Gregory Hernandez de los Angeles | @jtagutm |
