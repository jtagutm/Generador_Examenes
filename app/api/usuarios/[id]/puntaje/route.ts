import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await prisma.usuario.findUnique({
    where: { id: Number(id) },
    select: { puntaje_total: true, nombre: true },
  });
  return NextResponse.json(usuario);
}
