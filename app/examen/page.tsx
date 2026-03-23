"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Respuesta = { id: number; texto: string; es_correcta: number };
type Pregunta = { id: number; enunciado: string; tema: string; respuestas: Respuesta[] };

export default function ExamenPage() {
  const router = useRouter();
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [resultados, setResultados] = useState<{ correcto: number }[]>([]);
  const [usuario, setUsuario] = useState<{ id: number } | null>(null);
  const [examenId, setExamenId] = useState<number | null>(null);
  const [respondiendo, setRespondiendo] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("usuario");
    const e = localStorage.getItem("examen");
    if (!u || !e) return router.push("/");
    const parsedUsuario = JSON.parse(u);
    const parsedPreguntas: Pregunta[] = JSON.parse(e);
    setUsuario(parsedUsuario);
    setPreguntas(parsedPreguntas);
    const tema = parsedPreguntas[0]?.tema ?? "General";
    fetch("/api/examenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario_id: parsedUsuario.id, tema, total: parsedPreguntas.length }),
    }).then(r => r.json()).then(d => setExamenId(d.id));
  }, []);

  async function responder(respuesta: Respuesta) {
    if (respondiendo) return;
    setRespondiendo(true);
    const pregunta = preguntas[indice];
    const res = await fetch(`/api/usuarios/${usuario!.id}/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta_id: pregunta.id, respuesta_id: respuesta.id, examen_id: examenId }),
    });
    const data = await res.json();
    const nuevos = [...resultados, { correcto: data.es_correcto }];
    setResultados(nuevos);

    setTimeout(async () => {
      if (indice + 1 >= preguntas.length) {
        const puntaje = nuevos.filter(r => r.correcto === 1).length;
        if (examenId) {
          await fetch(`/api/examenes/${examenId}/finalizar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ puntaje }),
          });
        }
        localStorage.setItem("resultados", JSON.stringify(nuevos));
        localStorage.setItem("examen_preguntas", JSON.stringify(preguntas));
        router.push("/resultado");
      } else {
        setIndice(indice + 1);
        setRespondiendo(false);
      }
    }, 300);
  }

  if (!preguntas.length) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, border: "3px solid var(--border)",
          borderTopColor: "var(--indigo)", borderRadius: "50%",
          animation: "spin-slow 0.8s linear infinite", margin: "0 auto 16px",
        }} />
        <p style={{ color: "var(--text-muted)" }}>Cargando examen...</p>
      </div>
    </div>
  );

  const pregunta = preguntas[indice];
  const progreso = ((indice) / preguntas.length) * 100;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: "var(--border)", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{
          height: "100%",
          width: `${((indice + 1) / preguntas.length) * 100}%`,
          background: "linear-gradient(90deg, var(--indigo), var(--violet))",
          transition: "width 0.5s ease",
        }} />
      </div>

      {/* Header */}
      <div style={{
        padding: "24px 32px", borderBottom: "1px solid var(--border)",
        background: "var(--bg-2)", display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 3,
      }}>
        <div>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
            color: "var(--indigo-light)",
          }}>
            {pregunta.tema}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Dots progress */}
          <div style={{ display: "flex", gap: 6 }}>
            {preguntas.map((_, i) => (
              <div key={i} style={{
                width: i < indice ? 8 : i === indice ? 10 : 8,
                height: i < indice ? 8 : i === indice ? 10 : 8,
                borderRadius: "50%",
                background: i < indice
                  ? "var(--emerald)"
                  : i === indice
                  ? "var(--indigo)"
                  : "var(--border)",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
            color: "var(--text-secondary)",
          }}>
            {indice + 1} / {preguntas.length}
          </span>
        </div>
      </div>

      {/* Question area */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 24px",
      }}>
        <div style={{
          width: "100%", maxWidth: 640,
          animation: "fadeUp 0.4s ease both",
          key: indice, // remount on question change
        }}>
          {/* Question number badge */}
          <div style={{ marginBottom: 20 }}>
            <span className="badge badge-indigo">Pregunta {indice + 1}</span>
          </div>

          {/* Question text */}
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22,
            color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 32,
          }}>
            {pregunta.enunciado}
          </h2>

          {/* Answer options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pregunta.respuestas.map((r, i) => (
              <button
                key={r.id}
                onClick={() => responder(r)}
                disabled={respondiendo}
                style={{
                  textAlign: "left",
                  padding: "16px 20px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--text-primary)",
                  cursor: respondiendo ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: 14,
                  transition: "all 0.15s",
                  fontSize: 15,
                  animationDelay: `${i * 0.07}s`,
                  animation: "fadeUp 0.4s ease both",
                }}
                onMouseEnter={e => {
                  if (!respondiendo) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--indigo)";
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                    (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                  (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  background: "var(--bg-3)", border: "1px solid var(--border-light)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                  color: "var(--text-muted)",
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {r.texto}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}