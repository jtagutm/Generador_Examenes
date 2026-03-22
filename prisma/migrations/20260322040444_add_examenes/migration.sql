-- CreateTable
CREATE TABLE "Examen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "tema" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "puntaje" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    CONSTRAINT "Examen_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Intento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "pregunta_id" INTEGER NOT NULL,
    "respuesta_id" INTEGER NOT NULL,
    "examen_id" INTEGER,
    "es_correcto" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Intento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Intento_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "Pregunta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Intento_respuesta_id_fkey" FOREIGN KEY ("respuesta_id") REFERENCES "Respuesta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Intento_examen_id_fkey" FOREIGN KEY ("examen_id") REFERENCES "Examen" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Intento" ("es_correcto", "id", "pregunta_id", "respuesta_id", "usuario_id") SELECT "es_correcto", "id", "pregunta_id", "respuesta_id", "usuario_id" FROM "Intento";
DROP TABLE "Intento";
ALTER TABLE "new_Intento" RENAME TO "Intento";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
