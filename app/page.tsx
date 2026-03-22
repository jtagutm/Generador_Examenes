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
    setCargando(true);
    setMsg("");
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
    setCargando(true);
    setMsg("");
    const res = await fetch("/api/preguntas");
    const data = await res.json();
    setCargando(false);
    if (!data.length) return setMsg("No hay preguntas en la BD todavía");
    const seleccion = data.slice(0, cantidad);
    localStorage.setItem("examen", JSON.stringify(seleccion));
    router.push("/examen");
  }

  function cerrarSesion() {
    localStorage.clear();
    router.push("/login");
  }

  if (!usuario) return null;
  const esAdmin = usuario.email === ADMIN_EMAIL;

  return (
    <main style={{ maxWidth: 600, margin: "60px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Hola, {usuario.nombre}</h1>
        <button onClick={cerrarSesion}>Cerrar sesión</button>
      </div>

      {ultimoExamen ? (
        <div style={{ background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: 4, padding: 12, marginBottom: 16 }}>
          <p style={{ margin: 0 }}> Último examen: <strong>{ultimoExamen.tema}</strong></p>
          <p style={{ margin: 0 }}>Puntaje: <strong>{ultimoExamen.puntaje} / {ultimoExamen.total}</strong></p>
          <small style={{ color: "#666" }}>{new Date(ultimoExamen.fecha).toLocaleDateString("es-MX", { dateStyle: "long" })}</small>
        </div>
      ) : (
        <p style={{ color: "#666" }}>Aún no has hecho ningún examen.</p>
      )}

      <hr />
      <h2>Nuevo examen</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input placeholder="Tema (ej. Revolución Mexicana)"
          value={tema} onChange={e => setTema(e.target.value)} />
        <select value={cantidad} onChange={e => setCantidad(Number(e.target.value))}>
          <option value={3}>3 preguntas</option>
          <option value={5}>5 preguntas</option>
          <option value={10}>10 preguntas</option>
        </select>
        <select value={dificultad} onChange={e => setDificultad(e.target.value)}>
          <option value="fácil">Fácil</option>
          <option value="media">Media</option>
          <option value="difícil">Difícil</option>
        </select>
        {msg && <p style={{ color: "red" }}>{msg}</p>}
        <button onClick={generarExamen} disabled={cargando} style={{cursor: "pointer"}}>
          {cargando ? "Generando..." : "Generar con IA"}
        </button>
        <button onClick={usarPreguntasExistentes} disabled={cargando}
          style={{ border: "1px solid #FFFFFF", cursor: "pointer" }}>
          {cargando ? "Cargando..." : "Usar preguntas existentes"}
        </button>
      </div>

      {esAdmin && (
        <>
          <hr />
          <button onClick={() => router.push("/admin")}
            style={{ border: "1px solid #FFFFFF", cursor: "pointer" }}>
            .........Panel de administración.........
          </button>
        </>
      )}
    </main>
  );
}
