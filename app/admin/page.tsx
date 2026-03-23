"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Respuesta = { id: number; texto: string; es_correcta: number };
type Pregunta = { id: number; tema: string; enunciado: string; dificultad: string; respuestas: Respuesta[] };
type UltimoExamen = { tema: string; puntaje: number; total: number; fecha: string };
type Usuario = { id: number; nombre: string; email: string; puntaje_total: number; examenes: UltimoExamen[] };

const difBadge: Record<string, string> = {
  "fácil": "badge-emerald",
  "media": "badge-amber",
  "difícil": "badge-rose",
};

export default function AdminPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [tab, setTab] = useState<"preguntas" | "usuarios">("preguntas");
  const [editandoPregunta, setEditandoPregunta] = useState<Pregunta | null>(null);
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevaPregunta, setNuevaPregunta] = useState({
    tema: "", enunciado: "", dificultad: "media",
    respuestas: [
      { texto: "", es_correcta: 1 },
      { texto: "", es_correcta: 0 },
      { texto: "", es_correcta: 0 },
      { texto: "", es_correcta: 0 },
    ],
  });

  useEffect(() => {
    const u = localStorage.getItem("usuario");
    if (!u) return router.push("/login");
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const [u, p] = await Promise.all([
      fetch("/api/usuarios").then(r => r.json()),
      fetch("/api/preguntas").then(r => r.json()),
    ]);
    setUsuarios(u);
    setPreguntas(p);
  }

  async function eliminarPregunta(id: number) {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    await fetch(`/api/preguntas/${id}`, { method: "DELETE" });
    setPreguntas(preguntas.filter(p => p.id !== id));
  }

  async function guardarEdicionPregunta() {
    if (!editandoPregunta) return;
    const res = await fetch(`/api/preguntas/${editandoPregunta.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editandoPregunta),
    });
    if (res.ok) {
      const actualizada = await res.json();
      setPreguntas(preguntas.map(p => p.id === actualizada.id ? actualizada : p));
      setEditandoPregunta(null);
    }
  }

  async function crearPregunta() {
    const res = await fetch("/api/preguntas", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaPregunta),
    });
    if (res.ok) {
      const data = await res.json();
      setPreguntas([...preguntas, data]);
      setMostrarForm(false);
      setNuevaPregunta({
        tema: "", enunciado: "", dificultad: "media",
        respuestas: [{ texto: "", es_correcta: 1 }, { texto: "", es_correcta: 0 }, { texto: "", es_correcta: 0 }, { texto: "", es_correcta: 0 }],
      });
    }
  }

  async function eliminarUsuario(id: number) {
    if (!confirm("¿Eliminar este usuario?")) return;
    await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    setUsuarios(usuarios.filter(u => u.id !== id));
  }

  async function guardarEdicionUsuario() {
    if (!editandoUsuario) return;
    const res = await fetch(`/api/usuarios/${editandoUsuario.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: editandoUsuario.nombre, email: editandoUsuario.email }),
    });
    if (res.ok) {
      setUsuarios(usuarios.map(u => u.id === editandoUsuario.id ? editandoUsuario : u));
      setEditandoUsuario(null);
    }
  }

  function actualizarRespuestaEdicion(i: number, campo: "texto" | "es_correcta", valor: string | number) {
    if (!editandoPregunta) return;
    const nuevas = editandoPregunta.respuestas.map((r, idx) => {
      if (campo === "es_correcta") return { ...r, es_correcta: idx === i ? 1 : 0 };
      return idx === i ? { ...r, texto: valor as string } : r;
    });
    setEditandoPregunta({ ...editandoPregunta, respuestas: nuevas });
  }

  const inputStyle: React.CSSProperties = {
    padding: "10px 14px", background: "var(--bg-2)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)", color: "var(--text-primary)", width: "100%",
    outline: "none", fontSize: 14, fontFamily: "var(--font-body)",
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{
        padding: "20px 32px", borderBottom: "1px solid var(--border)",
        background: "var(--bg-2)", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, var(--violet), var(--indigo))",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>⚙</div>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
              color: "var(--text-primary)", lineHeight: 1,
            }}>Panel de administración</h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {preguntas.length} preguntas · {usuarios.length} usuarios
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="btn-ghost"
          style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
        >
          ← Inicio
        </button>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 28,
          background: "var(--bg-2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)", padding: 4, width: "fit-content",
        }}>
          {(["preguntas", "usuarios"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 20px", borderRadius: 6, border: "none",
              background: tab === t ? "var(--indigo)" : "transparent",
              color: tab === t ? "#fff" : "var(--text-muted)",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
              cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.02em",
            }}>
              {t === "preguntas" ? `Preguntas (${preguntas.length})` : `Usuarios (${usuarios.length})`}
            </button>
          ))}
        </div>

        {/* ── PREGUNTAS TAB ── */}
        {tab === "preguntas" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-primary)" }}>
                Banco de preguntas
              </h2>
              <button
                onClick={() => setMostrarForm(!mostrarForm)}
                className={mostrarForm ? "btn-ghost" : "btn-primary"}
                style={{ width: "auto", padding: "9px 20px", fontSize: 13 }}
              >
                {mostrarForm ? "Cancelar" : "+ Nueva pregunta"}
              </button>
            </div>

            {/* New question form */}
            {mostrarForm && (
              <div style={{
                background: "var(--surface)", border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 24,
                animation: "fadeUp 0.3s ease both",
              }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16, color: "var(--indigo-light)" }}>
                  Nueva pregunta
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="field">
                    <label>Tema</label>
                    <input style={inputStyle} placeholder="ej. Historia de México"
                      value={nuevaPregunta.tema}
                      onChange={e => setNuevaPregunta({ ...nuevaPregunta, tema: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Enunciado</label>
                    <textarea style={{ ...inputStyle, height: 80, resize: "vertical" as const }}
                      placeholder="Escribe la pregunta aquí..."
                      value={nuevaPregunta.enunciado}
                      onChange={e => setNuevaPregunta({ ...nuevaPregunta, enunciado: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Dificultad</label>
                    <select style={inputStyle} value={nuevaPregunta.dificultad}
                      onChange={e => setNuevaPregunta({ ...nuevaPregunta, dificultad: e.target.value })}>
                      <option value="fácil">Fácil</option>
                      <option value="media">Media</option>
                      <option value="difícil">Difícil</option>
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--text-muted)", marginBottom: 10 }}>
                      Respuestas (la primera es la correcta)
                    </p>
                    {nuevaPregunta.respuestas.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 14, width: 20 }}>{i === 0 ? "✅" : "❌"}</span>
                        <input style={{ ...inputStyle, flex: 1 }} placeholder={`Opción ${i + 1}`}
                          value={r.texto}
                          onChange={e => {
                            const nuevas = [...nuevaPregunta.respuestas];
                            nuevas[i] = { ...nuevas[i], texto: e.target.value };
                            setNuevaPregunta({ ...nuevaPregunta, respuestas: nuevas });
                          }} />
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={crearPregunta} style={{ marginTop: 4 }}>
                    Guardar pregunta
                  </button>
                </div>
              </div>
            )}

            {/* Questions list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {preguntas.map((p, idx) => (
                <div key={p.id} style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius)", padding: 18,
                  animation: `fadeUp 0.3s ${idx * 0.04}s ease both`,
                }}>
                  {editandoPregunta?.id === p.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <input style={inputStyle} placeholder="Tema" value={editandoPregunta.tema}
                        onChange={e => setEditandoPregunta({ ...editandoPregunta, tema: e.target.value })} />
                      <textarea style={{ ...inputStyle, height: 72, resize: "vertical" as const }}
                        value={editandoPregunta.enunciado}
                        onChange={e => setEditandoPregunta({ ...editandoPregunta, enunciado: e.target.value })} />
                      <select style={inputStyle} value={editandoPregunta.dificultad}
                        onChange={e => setEditandoPregunta({ ...editandoPregunta, dificultad: e.target.value })}>
                        <option value="fácil">Fácil</option>
                        <option value="media">Media</option>
                        <option value="difícil">Difícil</option>
                      </select>
                      {editandoPregunta.respuestas.map((r, i) => (
                        <div key={r.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <input type="radio" name="correcta" checked={r.es_correcta === 1}
                            onChange={() => actualizarRespuestaEdicion(i, "es_correcta", 1)}
                            title="Correcta" />
                          <input style={{ ...inputStyle, flex: 1 }} value={r.texto}
                            onChange={e => actualizarRespuestaEdicion(i, "texto", e.target.value)} />
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn-primary" onClick={guardarEdicionPregunta}
                          style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}>Guardar</button>
                        <button className="btn-ghost" onClick={() => setEditandoPregunta(null)}
                          style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" as const }}>
                          <span className="badge badge-indigo">{p.tema}</span>
                          <span className={`badge ${difBadge[p.dificultad] ?? "badge-indigo"}`}>{p.dificultad}</span>
                        </div>
                        <p style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 500, marginBottom: 8, lineHeight: 1.5 }}>
                          {p.enunciado}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                          {p.respuestas?.map(r => (
                            <span key={r.id} style={{
                              padding: "3px 10px", borderRadius: 100, fontSize: 12,
                              background: r.es_correcta ? "rgba(16,185,129,0.1)" : "var(--bg-3)",
                              border: `1px solid ${r.es_correcta ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                              color: r.es_correcta ? "var(--emerald)" : "var(--text-muted)",
                            }}>
                              {r.es_correcta ? "✓ " : ""}{r.texto}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={() => setEditandoPregunta(p)} style={{
                          padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                          background: "var(--indigo-dim)", border: "1px solid rgba(99,102,241,0.3)",
                          color: "var(--indigo-light)", fontFamily: "var(--font-display)", fontWeight: 600,
                        }}>Editar</button>
                        <button onClick={() => eliminarPregunta(p.id)} style={{
                          padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                          background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)",
                          color: "var(--rose)", fontFamily: "var(--font-display)", fontWeight: 600,
                        }}>Eliminar</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USUARIOS TAB ── */}
        {tab === "usuarios" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
              Usuarios registrados
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {usuarios.map((u, idx) => {
                const ultimo = u.examenes?.[0];
                return (
                  <div key={u.id} style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius)", padding: 18,
                    animation: `fadeUp 0.3s ${idx * 0.04}s ease both`,
                  }}>
                    {editandoUsuario?.id === u.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input style={inputStyle} value={editandoUsuario.nombre}
                          onChange={e => setEditandoUsuario({ ...editandoUsuario, nombre: e.target.value })} />
                        <input style={inputStyle} value={editandoUsuario.email}
                          onChange={e => setEditandoUsuario({ ...editandoUsuario, email: e.target.value })} />
                        <div style={{ display: "flex", gap: 10 }}>
                          <button className="btn-primary" onClick={guardarEdicionUsuario}
                            style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}>Guardar</button>
                          <button className="btn-ghost" onClick={() => setEditandoUsuario(null)}
                            style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                            background: "linear-gradient(135deg, var(--indigo), var(--violet))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff",
                          }}>
                            {u.nombre[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>
                              {u.nombre}
                            </p>
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{u.email}</p>
                            {ultimo && (
                              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                                Último: <span style={{ color: "var(--text-secondary)" }}>{ultimo.tema}</span> — {ultimo.puntaje}/{ultimo.total} pts
                              </p>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => setEditandoUsuario(u)} style={{
                            padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                            background: "var(--indigo-dim)", border: "1px solid rgba(99,102,241,0.3)",
                            color: "var(--indigo-light)", fontFamily: "var(--font-display)", fontWeight: 600,
                          }}>Editar</button>
                          <button onClick={() => eliminarUsuario(u.id)} style={{
                            padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                            background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)",
                            color: "var(--rose)", fontFamily: "var(--font-display)", fontWeight: 600,
                          }}>Eliminar</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}