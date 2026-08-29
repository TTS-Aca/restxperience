"use client";

import { useState } from "react";

export function SessionEmail({
  sessionId,
  email,
  onSaved,
}: {
  sessionId: string;
  email: string | null;
  onSaved: (email: string) => void;
}) {
  const [value, setValue] = useState(email || "");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email: value.trim() }),
      });
      if (!res.ok) {
        setStatus("No se pudo guardar.");
        return;
      }
      onSaved(value.trim());
      setStatus("Sesión guardada con tu correo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="glass-card flex flex-col gap-2 p-4 sm:flex-row sm:items-end"
    >
      <label className="block flex-1 text-xs tracking-wide text-white/40 uppercase">
        Correo para tu sesión
        <input
          type="email"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="tu@correo.com"
          className="input-glass mt-1"
        />
      </label>
      <button type="submit" disabled={busy} className="btn-ghost shrink-0">
        {busy ? "Guardando…" : "Guardar"}
      </button>
      {status && (
        <p className="w-full text-xs text-[#c4a574] sm:absolute sm:mt-16">
          {status}
        </p>
      )}
    </form>
  );
}
