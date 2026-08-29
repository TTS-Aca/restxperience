"use client";

import { Star } from "lucide-react";
import { useState } from "react";

export function ReviewPanel({
  sessionId,
  email,
}: {
  sessionId: string;
  email: string | null;
}) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      alert("Guarda tu correo arriba para dejar reseña.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email, stars, comment }),
      });
      if (res.ok) setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="glass-card p-6 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl text-white">
          Gracias por tu reseña
        </p>
        <p className="mt-2 text-sm text-white/55">
          Nos ayuda a cuidar cada detalle de la experiencia.
        </p>
      </section>
    );
  }

  return (
    <section className="glass-card space-y-4 p-6">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-white">
        ¿Cómo estuvo tu visita?
      </h2>
      <p className="text-sm text-white/55">
        Cuando la cuenta esté pagada, puedes dejar tu reseña solo con tu correo.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setStars(value)}
                aria-label={`${value} estrellas`}
              >
                <Star
                  className={`h-7 w-7 ${
                    value <= stars
                      ? "fill-[#c4a574] text-[#c4a574]"
                      : "text-white/25"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={3}
          placeholder="Cuéntanos qué disfrutaste…"
          className="input-glass resize-none"
        />
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Enviando…" : "Enviar reseña"}
        </button>
      </form>
    </section>
  );
}
