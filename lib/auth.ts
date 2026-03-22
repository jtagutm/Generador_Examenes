import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export function generarToken(payload: { id: number; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verificarToken(token: string) {
  return jwt.verify(token, SECRET) as { id: number; email: string };
}
