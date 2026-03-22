import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nombre: true,
      email: true,
      puntaje_total: true,
      examenes: {
        orderBy: { fecha: "desc" },
        take: 1,
        select: { tema: true, puntaje: true, total: true, fecha: true },
      },
    },
  });
  return NextResponse.json(usuarios);
}
