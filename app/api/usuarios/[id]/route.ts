import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { nombre, email } = await req.json();
  const usuario = await prisma.usuario.update({
    where: { id: Number(id) },
    data: { nombre, email },
  });
  return NextResponse.json(usuario);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.usuario.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
