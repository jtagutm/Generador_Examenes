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

  return (
    <main style={{ maxWidth: 600, margin: "60px auto", padding: 24 }}>
      <h1>Resultado</h1>
      <p style={{ fontSize: 24 }}>
        {correctas} / {resultados.length} correctas
      </p>
      <hr />
      <h2>Resumen</h2>
      {preguntas.map((p, i) => (
        <div key={p.id} style={{ marginBottom: 12, padding: 12, border: "1px solid #ccc",
          borderLeft: `4px solid ${resultados[i]?.correcto ? "green" : "red"}` }}>
          <p><strong>{p.enunciado}</strong></p>
          <p>{resultados[i]?.correcto ? "✅ Correcta" : "❌ Incorrecta"}</p>
        </div>
      ))}
      <button onClick={() => router.push("/")}>Volver al inicio</button>
    </main>
  );
}
