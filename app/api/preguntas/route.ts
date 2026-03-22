import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const preguntas = await prisma.pregunta.findMany({
    include: { respuestas: true },
  });
  return NextResponse.json(preguntas);
}

export async function POST(req: NextRequest) {
  const { tema, enunciado, dificultad, respuestas } = await req.json();
  const pregunta = await prisma.pregunta.create({
    data: {
      tema,
      enunciado,
      dificultad,
      respuestas: { create: respuestas },
    },
    include: { respuestas: true },
  });
  return NextResponse.json(pregunta, { status: 201 });
}
