import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { tema, enunciado, dificultad, respuestas } = await req.json();

  // Actualiza la pregunta
  await prisma.pregunta.update({
    where: { id: Number(id) },
    data: { tema, enunciado, dificultad },
  });

  // Si vienen respuestas, actualiza cada una por su id
  if (respuestas && respuestas.length) {
    await Promise.all(
      respuestas.map((r: { id: number; texto: string; es_correcta: number }) =>
        prisma.respuesta.update({
          where: { id: r.id },
          data: { texto: r.texto, es_correcta: r.es_correcta },
        })
      )
    );
  }

  const preguntaActualizada = await prisma.pregunta.findUnique({
    where: { id: Number(id) },
    include: { respuestas: true },
  });

  return NextResponse.json(preguntaActualizada);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.respuesta.deleteMany({ where: { pregunta_id: Number(id) } });
  await prisma.pregunta.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
