"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "registro">("entrar");
  const [form, setForm] = useState({ nombre: "", email: "", contrasena: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const url = modo === "entrar" ? "/api/auth/entrar" : "/api/auth/registro";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    router.push("/");
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "var(--bg)",
    }}>
      {/* Left panel — decorative */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--bg-2)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px",
      }}>
        {/* Background orbs */}
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          top: "10%", left: "-10%", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          bottom: "15%", right: "-5%", pointerEvents: "none",
        }} />

        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px),
                            linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: "0 auto 32px",
            background: "linear-gradient(135deg, var(--indigo), var(--violet))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
          }}>
            🎓
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36,
            color: "var(--text-primary)", lineHeight: 1.15, marginBottom: 16,
          }}>
            Aprende más<br />
            <span style={{ color: "var(--indigo-light)" }}>con cada examen</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 320, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Genera exámenes personalizados con IA y mejora tu rendimiento académico.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
            {[
              { value: "IA", label: "Generación" },
              { value: "∞", label: "Temas" },
              { value: "3", label: "Niveles" },
            ].map(s => (
              <div key={s.label} style={{
                padding: "14px 20px", borderRadius: "var(--radius)",
                background: "var(--surface)", border: "1px solid var(--border)",
                textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22,
                  color: "var(--indigo-light)",
                }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, letterSpacing: "0.05em" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "60px 48px",
        animation: "fadeUp 0.5s ease both",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Toggle */}
          <div style={{
            display: "flex", gap: 0, marginBottom: 40,
            background: "var(--bg-2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", padding: 4,
          }}>
            {(["entrar", "registro"] as const).map(m => (
              <button key={m} onClick={() => setModo(m)} style={{
                flex: 1, padding: "9px 16px",
                background: modo === m ? "var(--indigo)" : "transparent",
                color: modo === m ? "#fff" : "var(--text-muted)",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontWeight: 600, fontSize: 13,
                transition: "all 0.2s",
                letterSpacing: "0.02em",
              }}>
                {m === "entrar" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>

          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26,
            color: "var(--text-primary)", marginBottom: 8,
          }}>
            {modo === "entrar" ? "Bienvenido de vuelta" : "Crear cuenta"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
            {modo === "entrar"
              ? "Ingresa tus datos para continuar"
              : "Completa el formulario para empezar"}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {modo === "registro" && (
              <div className="field">
                <label>Nombre   </label>
                <input
                  placeholder="Tu nombre completo"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
            )}
            <div className="field">
              <label>Correo electrónico   </label>
              <input
                placeholder="tu@correo.com"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Contraseña   </label>
              <input
                placeholder="••••••••"
                type="password"
                value={form.contrasena}
                onChange={e => setForm({ ...form, contrasena: e.target.value })}
                required
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.25)",
                borderRadius: "var(--radius-sm)",
                color: "var(--rose)", fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "spin-slow 0.7s linear infinite", display: "inline-block",
                  }} />
                  Procesando...
                </>
              ) : (
                modo === "entrar" ? "Entrar →" : "Crear cuenta →"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}