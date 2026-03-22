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

  useEffect(() => {
    const u = localStorage.getItem("usuario");
    const e = localStorage.getItem("examen");
    if (!u || !e) return router.push("/");
    const parsedUsuario = JSON.parse(u);
    const parsedPreguntas: Pregunta[] = JSON.parse(e);
    setUsuario(parsedUsuario);
    setPreguntas(parsedPreguntas);

    // Crear el examen al inicio
    const tema = parsedPreguntas[0]?.tema ?? "General";
    fetch("/api/examenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario_id: parsedUsuario.id, tema, total: parsedPreguntas.length }),
    })
      .then(r => r.json())
      .then(d => setExamenId(d.id));
  }, []);

  async function responder(respuesta: Respuesta) {
    const pregunta = preguntas[indice];
    const res = await fetch(`/api/usuarios/${usuario!.id}/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta_id: pregunta.id, respuesta_id: respuesta.id, examen_id: examenId }),
    });
    const data = await res.json();
    const nuevos = [...resultados, { correcto: data.es_correcto }];
    setResultados(nuevos);

    if (indice + 1 >= preguntas.length) {
      // Finalizar examen
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
    }
  }

  if (!preguntas.length) return <p>Cargando...</p>;

  const pregunta = preguntas[indice];

  return (
    <main style={{ maxWidth: 600, margin: "60px auto", padding: 24 }}>
      <p>Pregunta {indice + 1} de {preguntas.length}</p>
      <h2>{pregunta.enunciado}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        {pregunta.respuestas.map(r => (
          <button key={r.id} onClick={() => responder(r)} style={{ textAlign: "left", padding: 12 }}>
            {r.texto}
          </button>
        ))}
      </div>
    </main>
  );
}
