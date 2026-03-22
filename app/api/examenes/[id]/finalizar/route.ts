import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { puntaje } = await req.json();
    const examen = await prisma.examen.update({
      where: { id: Number(id) },
      data: { puntaje },
    });
    return NextResponse.json(examen);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
