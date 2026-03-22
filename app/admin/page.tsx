"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Respuesta = { id: number; texto: string; es_correcta: number };
type Pregunta = { id: number; tema: string; enunciado: string; dificultad: string; respuestas: Respuesta[] };
type UltimoExamen = { tema: string; puntaje: number; total: number; fecha: string };
type Usuario = { id: number; nombre: string; email: string; puntaje_total: number; examenes: UltimoExamen[] };

export default function AdminPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [tab, setTab] = useState<"preguntas" | "usuarios">("preguntas");
  const [editandoPregunta, setEditandoPregunta] = useState<Pregunta | null>(null);
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null);
  const [nuevaPregunta, setNuevaPregunta] = useState({
    tema: "", enunciado: "", dificultad: "media",
    respuestas: [
      { texto: "", es_correcta: 1 },
      { texto: "", es_correcta: 0 },
      { texto: "", es_correcta: 0 },
      { texto: "", es_correcta: 0 },
    ]
  });
  const [mostrarForm, setMostrarForm] = useState(false);

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
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tema: editandoPregunta.tema,
        enunciado: editandoPregunta.enunciado,
        dificultad: editandoPregunta.dificultad,
        respuestas: editandoPregunta.respuestas,
      }),
    });
    if (res.ok) {
      const actualizada = await res.json();
      setPreguntas(preguntas.map(p => p.id === actualizada.id ? actualizada : p));
      setEditandoPregunta(null);
    }
  }

  async function crearPregunta() {
    const res = await fetch("/api/preguntas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaPregunta),
    });
    if (res.ok) {
      const data = await res.json();
      setPreguntas([...preguntas, data]);
      setMostrarForm(false);
      setNuevaPregunta({
        tema: "", enunciado: "", dificultad: "media",
        respuestas: [
          { texto: "", es_correcta: 1 },
          { texto: "", es_correcta: 0 },
          { texto: "", es_correcta: 0 },
          { texto: "", es_correcta: 0 },
        ]
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
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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

  const inputStyle = { padding: 6, width: "100%", boxSizing: "border-box" as const };
  const btnStyle = { padding: "6px 12px", cursor: "pointer" };

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Administración</h1>
        <button onClick={() => router.push("/")} style={btnStyle}>← Inicio</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab("preguntas")} disabled={tab === "preguntas"} style={btnStyle}>
          Preguntas ({preguntas.length})
        </button>
        <button onClick={() => setTab("usuarios")} disabled={tab === "usuarios"} style={btnStyle}>
          Usuarios ({usuarios.length})
        </button>
      </div>

      {/* ---- PREGUNTAS ---- */}
      {tab === "preguntas" && (
        <div>
          <button onClick={() => setMostrarForm(!mostrarForm)}
            style={{ ...btnStyle, marginBottom: 16, background: "#d4edda" }}>
            {mostrarForm ? "Cancelar" : "+ Nueva pregunta"}
          </button>

          {mostrarForm && (
            <div style={{ border: "1px solid #28a745", padding: 16, marginBottom: 16, borderRadius: 4 }}>
              <h3>Nueva pregunta</h3>
              <input style={inputStyle} placeholder="Tema" value={nuevaPregunta.tema}
                onChange={e => setNuevaPregunta({ ...nuevaPregunta, tema: e.target.value })} />
              <br /><br />
              <textarea style={{ ...inputStyle, height: 80 }} placeholder="Enunciado"
                value={nuevaPregunta.enunciado}
                onChange={e => setNuevaPregunta({ ...nuevaPregunta, enunciado: e.target.value })} />
              <br /><br />
              <select style={inputStyle} value={nuevaPregunta.dificultad}
                onChange={e => setNuevaPregunta({ ...nuevaPregunta, dificultad: e.target.value })}>
                <option value="fácil">Fácil</option>
                <option value="media">Media</option>
                <option value="difícil">Difícil</option>
              </select>
              <br /><br />
              <p><strong>Respuestas</strong> (la primera es la correcta):</p>
              {nuevaPregunta.respuestas.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                  <span style={{ minWidth: 20 }}>{i === 0 ? "✅" : "❌"}</span>
                  <input style={{ flex: 1, padding: 6 }} placeholder={`Opción ${i + 1}`}
                    value={r.texto}
                    onChange={e => {
                      const nuevas = [...nuevaPregunta.respuestas];
                      nuevas[i] = { ...nuevas[i], texto: e.target.value };
                      setNuevaPregunta({ ...nuevaPregunta, respuestas: nuevas });
                    }} />
                </div>
              ))}
              <button onClick={crearPregunta} style={{ ...btnStyle, background: "#28a745", color: "white" }}>
                Guardar pregunta
              </button>
            </div>
          )}

          {preguntas.map(p => (
            <div key={p.id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 8, borderRadius: 4 }}>
              {editandoPregunta?.id === p.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input style={inputStyle} placeholder="Tema" value={editandoPregunta.tema}
                    onChange={e => setEditandoPregunta({ ...editandoPregunta, tema: e.target.value })} />
                  <textarea style={{ ...inputStyle, height: 80 }} value={editandoPregunta.enunciado}
                    onChange={e => setEditandoPregunta({ ...editandoPregunta, enunciado: e.target.value })} />
                  <select style={inputStyle} value={editandoPregunta.dificultad}
                    onChange={e => setEditandoPregunta({ ...editandoPregunta, dificultad: e.target.value })}>
                    <option value="fácil">Fácil</option>
                    <option value="media">Media</option>
                    <option value="difícil">Difícil</option>
                  </select>
                  <p><strong>Respuestas:</strong></p>
                  {editandoPregunta.respuestas.map((r, i) => (
                    <div key={r.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="radio" name="correcta" checked={r.es_correcta === 1}
                        onChange={() => actualizarRespuestaEdicion(i, "es_correcta", 1)}
                        title="Marcar como correcta" />
                      <input style={{ flex: 1, padding: 6 }} value={r.texto}
                        onChange={e => actualizarRespuestaEdicion(i, "texto", e.target.value)} />
                      <span style={{ color: r.es_correcta ? "green" : "#999", fontSize: 12 }}>
                        {r.es_correcta ? "✅ correcta" : "incorrecta"}
                      </span>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={guardarEdicionPregunta}
                      style={{ ...btnStyle, background: "#007bff", color: "white" }}>Guardar</button>
                    <button onClick={() => setEditandoPregunta(null)} style={btnStyle}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <p><strong>{p.enunciado}</strong></p>
                    <small>{p.tema} · {p.dificultad}</small>
                    <ul style={{ margin: "8px 0 0 16px" }}>
                      {p.respuestas?.map(r => (
                        <li key={r.id} style={{ color: r.es_correcta ? "green" : "inherit" }}>
                          {r.es_correcta ? "✅ " : ""}{r.texto}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
                    <button onClick={() => setEditandoPregunta(p)} style={btnStyle}> Editar</button>
                    <button onClick={() => eliminarPregunta(p.id)} style={{ ...btnStyle, color: "red" }}>Eliminar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ---- USUARIOS ---- */}
      {tab === "usuarios" && (
        <div>
          {usuarios.map(u => {
            const ultimo = u.examenes?.[0];
            return (
              <div key={u.id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 8, borderRadius: 4 }}>
                {editandoUsuario?.id === u.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input style={inputStyle} value={editandoUsuario.nombre}
                      onChange={e => setEditandoUsuario({ ...editandoUsuario, nombre: e.target.value })} />
                    <input style={inputStyle} value={editandoUsuario.email}
                      onChange={e => setEditandoUsuario({ ...editandoUsuario, email: e.target.value })} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={guardarEdicionUsuario}
                        style={{ ...btnStyle, background: "#007bff", color: "white" }}>Guardar</button>
                      <button onClick={() => setEditandoUsuario(null)} style={btnStyle}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: 0 }}><strong>{u.nombre}</strong> — {u.email}</p>
                      {ultimo ? (
                        <div style={{ marginTop: 6, padding: 8, background: "#f8f9fa", borderRadius: 4 }}>
                          <small><strong>Último examen:</strong> {ultimo.tema}</small><br />
                          <small>Puntaje: <strong>{ultimo.puntaje} / {ultimo.total}</strong></small><br />
                          <small style={{ color: "#666" }}>
                            {new Date(ultimo.fecha).toLocaleDateString("es-MX", { dateStyle: "long" })}
                          </small>
                        </div>
                      ) : (
                        <small style={{ color: "#999" }}>Sin exámenes todavía</small>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setEditandoUsuario(u)} style={btnStyle}>Editar</button>
                      <button onClick={() => eliminarUsuario(u.id)} style={{ ...btnStyle, color: "red" }}>Eliminar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
