import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const examen = await prisma.examen.findFirst({
    where: { usuario_id: Number(id) },
    orderBy: { fecha: "desc" },
  });
  return NextResponse.json(examen);
}
