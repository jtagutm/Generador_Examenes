import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { pregunta_id, respuesta_id, examen_id } = await req.json();

  const respuesta = await prisma.respuesta.findUnique({ where: { id: respuesta_id } });
  const es_correcto = respuesta?.es_correcta === 1 ? 1 : 0;

  const intento = await prisma.intento.create({
    data: { usuario_id: Number(id), pregunta_id, respuesta_id, es_correcto, examen_id },
  });

  return NextResponse.json({ intento, es_correcto });
}
