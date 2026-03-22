import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generarToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, contrasena } = await req.json();
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) return NextResponse.json({ error: "Email ya registrado" }, { status: 400 });
    const hash = await bcrypt.hash(contrasena, 10);
    const usuario = await prisma.usuario.create({
      data: { nombre, email, contrasena: hash },
    });
    const token = generarToken({ id: usuario.id, email: usuario.email });
    return NextResponse.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
