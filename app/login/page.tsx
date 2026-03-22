"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "registro">("entrar");
  const [form, setForm] = useState({ nombre: "", email: "", contrasena: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const url = modo === "entrar" ? "/api/auth/entrar" : "/api/auth/registro";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    router.push("/");
  }

  return (
    <main style={{ maxWidth: 400, margin: "100px auto", padding: 24 }}>
      <h1>Generador de Exámenes</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setModo("entrar")} disabled={modo === "entrar"}>Iniciar sesión</button>
        <button onClick={() => setModo("registro")} disabled={modo === "registro"}>Registrarse</button>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {modo === "registro" && (
          <input placeholder="Nombre" value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })} required />
        )}
        <input placeholder="Email" type="email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Contraseña" type="password" value={form.contrasena}
          onChange={e => setForm({ ...form, contrasena: e.target.value })} required />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">{modo === "entrar" ? "Entrar" : "Registrarse"}</button>
      </form>
    </main>
  );
}
