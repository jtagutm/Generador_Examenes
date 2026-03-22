import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { tema, cantidad = 5, dificultad = "media" } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Genera ${cantidad} preguntas de opción múltiple sobre "${tema}" con dificultad ${dificultad}.
Responde SOLO con un array JSON, sin explicaciones ni backticks, con este formato exacto:
[
  {
    "enunciado": "...",
    "respuestas": [
      { "texto": "...", "es_correcta": 1 },
      { "texto": "...", "es_correcta": 0 },
      { "texto": "...", "es_correcta": 0 },
      { "texto": "...", "es_correcta": 0 }
    ]
  }
]`;

    const result = await model.generateContent(prompt);
    const texto = result.response.text().replace(/```json|```/g, "").trim();
    const preguntas = JSON.parse(texto);

    const creadas = await Promise.all(
      preguntas.map((p: { enunciado: string; respuestas: { texto: string; es_correcta: number }[] }) =>
        prisma.pregunta.create({
          data: {
            tema,
            enunciado: p.enunciado,
            dificultad,
            respuestas: { create: p.respuestas },
          },
          include: { respuestas: true },
        })
      )
    );

    return NextResponse.json(creadas, { status: 201 });
  } catch (e: any) {
    console.error("ERROR GENERAR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
