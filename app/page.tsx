"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "yo@yo";
type UltimoExamen = { tema: string; puntaje: number; total: number; fecha: string } | null;

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<{ id: number; nombre: string; email: string } | null>(null);
  const [ultimoExamen, setUltimoExamen] = useState<UltimoExamen>(null);
  const [tema, setTema] = useState("");
  const [cantidad, setCantidad] = useState(5);
  const [dificultad, setDificultad] = useState("media");
  const [cargando, setCargando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const u = localStorage.getItem("usuario");
    if (!u) return router.push("/login");
    const parsed = JSON.parse(u);
    setUsuario(parsed);
    fetch(`/api/usuarios/${parsed.id}/ultimo-examen`)
      .then(r => r.json())
      .then(d => setUltimoExamen(d));
  }, []);

  async function generarExamen() {
    if (!tema.trim()) return setMsg("Escribe un tema");
    setCargando(true); setMsg("");
    const token = localStorage.getItem("token");
    const res = await fetch("/api/preguntas/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tema, cantidad, dificultad }),
    });
    const data = await res.json();
    setCargando(false);
    if (!res.ok) return setMsg(data.error);
    localStorage.setItem("examen", JSON.stringify(data));
    router.push("/examen");
  }

  async function usarPreguntasExistentes() {
    setCargando(true); setMsg("");
    const res = await fetch("/api/preguntas");
    const data = await res.json();
    setCargando(false);
    if (!data.length) return setMsg("No hay preguntas en la BD todavía");
    localStorage.setItem("examen", JSON.stringify(data.slice(0, cantidad)));
    router.push("/examen");
  }

  if (!usuario) return null;
  const esAdmin = usuario.email === ADMIN_EMAIL;
  const porcentaje = ultimoExamen
    ? Math.round((ultimoExamen.puntaje / ultimoExamen.total) * 100)
    : null;

  return (
    <main style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top nav */}
      <nav style={{
        padding: "16px 32px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-2)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, var(--indigo), var(--violet))",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🎓</div>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
            color: "var(--text-primary)",
          }}>ExamGen</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {esAdmin && (
            <button
              onClick={() => router.push("/admin")}
              style={{
                background: "var(--violet-dim)", border: "1px solid rgba(139,92,246,0.3)",
                color: "#a78bfa", borderRadius: 6, padding: "6px 14px",
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12,
                cursor: "pointer", letterSpacing: "0.04em",
              }}
            >
              ⚙ Admin
            </button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--indigo), var(--violet))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#fff",
            }}>
              {usuario.nombre[0].toUpperCase()}
            </div>
            <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>{usuario.nombre}</span>
          </div>
          <button
            onClick={() => { localStorage.clear(); router.push("/login"); }}
            style={{
              background: "none", border: "none", color: "var(--text-muted)",
              cursor: "pointer", fontSize: 13, padding: "6px 8px",
              transition: "color 0.2s",
            }}
          >
            Salir
          </button>
        </div>
      </nav>

      <div style={{
        flex: 1, padding: "48px 32px", maxWidth: 900,
        margin: "0 auto", width: "100%",
        display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start",
      }}>
        {/* Left — main form */}
        <div style={{ animation: "fadeUp 0.5s ease both" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32,
            color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.2,
          }}>
            Nuevo examen
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
            Elige un tema y la IA generará las preguntas por ti
          </p>

          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: 28,
            display: "flex", flexDirection: "column", gap: 20,
          }}>
            {/* Topic */}
            <div className="field">
              <label>Tema del examen</label>
              <input
                placeholder="ej. Revolución Mexicana, Álgebra lineal, Fotosíntesis..."
                value={tema}
                onChange={e => setTema(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generarExamen()}
                style={{ fontSize: 15 }}
              />
            </div>

            {/* Options row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="field">
                <label>Cantidad</label>
                <select value={cantidad} onChange={e => setCantidad(Number(e.target.value))}>
                  <option value={3}>3 preguntas</option>
                  <option value={5}>5 preguntas</option>
                  <option value={10}>10 preguntas</option>
                </select>
              </div>
              <div className="field">
                <label>Dificultad</label>
                <select value={dificultad} onChange={e => setDificultad(e.target.value)}>
                  <option value="fácil">🟢 Fácil</option>
                  <option value="media">🟡 Media</option>
                  <option value="difícil">🔴 Difícil</option>
                </select>
              </div>
            </div>

            {msg && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)",
                borderRadius: "var(--radius-sm)", color: "var(--rose)", fontSize: 13,
              }}>{msg}</div>
            )}

            <button
              className="btn-primary"
              onClick={generarExamen}
              disabled={cargando}
              style={{ fontSize: 15, padding: "13px 24px" }}
            >
              {cargando ? (
                <>
                  <span style={{
                    width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "spin-slow 0.7s linear infinite",
                  }} />
                  Generando preguntas...
                </>
              ) : "✦ Generar con IA"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.05em" }}>O</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <button
              className="btn-ghost"
              onClick={usarPreguntasExistentes}
              disabled={cargando}
            >
              Usar preguntas existentes
            </button>
          </div>
        </div>

        {/* Right — stats & last exam */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.5s 0.1s ease both" }}>
          {/* Last exam card */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: 24, overflow: "hidden", position: "relative",
          }}>
            <div style={{
              position: "absolute", top: -30, right: -30, width: 120, height: 120,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <p style={{
              fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--text-muted)", marginBottom: 16,
            }}>Último examen</p>

            {ultimoExamen ? (
              <>
                <p style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17,
                  color: "var(--text-primary)", marginBottom: 4,
                }}>{ultimoExamen.tema}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32,
                    color: porcentaje! >= 70 ? "var(--emerald)" : porcentaje! >= 40 ? "var(--amber)" : "var(--rose)",
                  }}>
                    {porcentaje}%
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    ({ultimoExamen.puntaje}/{ultimoExamen.total})
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{
                  height: 4, background: "var(--bg-3)", borderRadius: 4, overflow: "hidden", marginBottom: 12,
                }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    width: `${porcentaje}%`,
                    background: porcentaje! >= 70
                      ? "var(--emerald)"
                      : porcentaje! >= 40 ? "var(--amber)" : "var(--rose)",
                    transition: "width 0.8s ease",
                  }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {new Date(ultimoExamen.fecha).toLocaleDateString("es-MX", { dateStyle: "long" })}
                </p>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                  Aún no has hecho<br />ningún examen
                </p>
              </div>
            )}
          </div>

          {/* Difficulty legend */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: 20,
          }}>
            <p style={{
              fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--text-muted)", marginBottom: 14,
            }}>Niveles</p>
            {[
              { label: "Fácil", desc: "Conceptos básicos", color: "var(--emerald)", dot: "🟢" },
              { label: "Media", desc: "Comprensión aplicada", color: "var(--amber)", dot: "🟡" },
              { label: "Difícil", desc: "Análisis profundo", color: "var(--rose)", dot: "🔴" },
            ].map(n => (
              <div key={n.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{n.dot} {n.label}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{n.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}