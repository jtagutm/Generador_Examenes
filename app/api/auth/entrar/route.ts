import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generarToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, contrasena } = await req.json();
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    const valido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valido) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    const token = generarToken({ id: usuario.id, email: usuario.email });
    return NextResponse.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
