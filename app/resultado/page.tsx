"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultadoPage() {
  const router = useRouter();
  const [resultados, setResultados] = useState<{ correcto: number }[]>([]);
  const [preguntas, setPreguntas] = useState<any[]>([]);

  useEffect(() => {
    const r = localStorage.getItem("resultados");
    const p = localStorage.getItem("examen_preguntas");
    if (!r || !p) return router.push("/");
    setResultados(JSON.parse(r));
    setPreguntas(JSON.parse(p));
  }, []);

  const correctas = resultados.filter(r => r.correcto === 1).length;
  const total = resultados.length;
  const porcentaje = total ? Math.round((correctas / total) * 100) : 0;

  const getCalificacion = () => {
    if (porcentaje >= 90) return { label: "Excelente", color: "var(--emerald)", emoji: "🏆" };
    if (porcentaje >= 70) return { label: "Bien", color: "var(--indigo-light)", emoji: "✅" };
    if (porcentaje >= 50) return { label: "Regular", color: "var(--amber)", emoji: "📚" };
    return { label: "A mejorar", color: "var(--rose)", emoji: "💪" };
  };

  const cal = getCalificacion();

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 64 }}>
      {/* Hero result */}
      <div style={{
        background: "var(--bg-2)", borderBottom: "1px solid var(--border)",
        padding: "64px 24px 48px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative", overflow: "hidden",
        animation: "fadeUp 0.5s ease both",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: `radial-gradient(circle, ${cal.color}18 0%, transparent 70%)`,
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{cal.emoji}</div>

          {/* Score ring visual */}
          <div style={{
            width: 140, height: 140, borderRadius: "50%", margin: "0 auto 24px",
            background: `conic-gradient(${cal.color} ${porcentaje * 3.6}deg, var(--bg-3) 0deg)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            <div style={{
              width: 110, height: 110, borderRadius: "50%",
              background: "var(--bg-2)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34,
                color: cal.color, lineHeight: 1,
              }}>{porcentaje}%</span>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{correctas}/{total}</span>
            </div>
          </div>

          <span className={`badge badge-${porcentaje >= 70 ? "emerald" : porcentaje >= 50 ? "amber" : "rose"}`}
            style={{ fontSize: 13, padding: "5px 16px" }}>
            {cal.label}
          </span>

          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28,
            color: "var(--text-primary)", margin: "16px 0 8px",
          }}>
            {correctas} de {total} correctas
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            {porcentaje >= 70 ? "¡Buen trabajo! Sigue practicando." : "Sigue estudiando, tú puedes."}
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
            <button
              className="btn-primary"
              onClick={() => router.push("/")}
              style={{ width: "auto", padding: "11px 28px" }}
            >
              Nuevo examen
            </button>
          </div>
        </div>
      </div>

      {/* Question breakdown */}
      <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 24px" }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
          color: "var(--text-secondary)", marginBottom: 20, letterSpacing: "0.02em",
        }}>
          Resumen de respuestas
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {preguntas.map((p, i) => {
            const correcto = resultados[i]?.correcto === 1;
            return (
              <div key={p.id} style={{
                background: "var(--surface)",
                border: `1px solid ${correcto ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.2)"}`,
                borderRadius: "var(--radius)",
                padding: "16px 20px",
                display: "flex", gap: 16, alignItems: "flex-start",
                animation: `fadeUp 0.4s ${i * 0.06}s ease both`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: correcto ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.1)",
                  border: `1px solid ${correcto ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.25)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>
                  {correcto ? "✅" : "❌"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14,
                    color: "var(--text-primary)", lineHeight: 1.45, marginBottom: 4,
                  }}>
                    {p.enunciado}
                  </p>
                  <span style={{
                    fontSize: 12, color: correcto ? "var(--emerald)" : "var(--rose)",
                    fontWeight: 600,
                  }}>
                    {correcto ? "Correcto" : "Incorrecto"}
                  </span>
                </div>
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
                  color: "var(--text-muted)", alignSelf: "center",
                }}>
                  #{i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}