import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { usuario_id, tema, total } = await req.json();
    const examen = await prisma.examen.create({
      data: { usuario_id, tema, total },
    });
    return NextResponse.json(examen, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
