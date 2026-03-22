-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "puntaje_total" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Pregunta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tema" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "dificultad" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Respuesta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pregunta_id" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "es_correcta" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Respuesta_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "Pregunta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Intento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "pregunta_id" INTEGER NOT NULL,
    "respuesta_id" INTEGER NOT NULL,
    "es_correcto" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Intento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Intento_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "Pregunta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Intento_respuesta_id_fkey" FOREIGN KEY ("respuesta_id") REFERENCES "Respuesta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
