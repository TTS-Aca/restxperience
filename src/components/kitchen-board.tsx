"use client";

import { useCallback, useEffect, useState } from "react";

type KitchenOrder = {
  id: string;
  total: number;
  paidAt: string | null;
  createdAt: string;
  items: { name: string; quantity: number }[];
  session: { table: { label: string; number: number } };
};

function elapsedSince(iso: string | null): string {
  const start = new Date(iso || Date.now()).getTime();
  const mins = Math.floor((Date.now() - start) / 60000);
  if (mins < 1) return "ahora";
  if (mins === 1) return "1 min";
  return `${mins} min`;
}

export function KitchenBoard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/kitchen/orders");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setOrders(data.orders || []);
  }, []);

  useEffect(() => {
    void fetch("/api/kitchen/login")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setAuthed(true);
          void loadOrders();
        }
      });
  }, [loadOrders]);

  useEffect(() => {
    if (!authed) return;
    const id = window.setInterval(() => void loadOrders(), 8000);
    return () => window.clearInterval(id);
  }, [authed, loadOrders]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/kitchen/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setMessage("Contraseña incorrecta");
      return;
    }
    setMessage(null);
    setAuthed(true);
    await loadOrders();
  }

  async function markServed(orderId: string) {
    setBusyId(orderId);
    const res = await fetch("/api/kitchen/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action: "served" }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "No se pudo marcar como servido");
      return;
    }
    setMessage("Pedido marcado como servido — llevar a mesa");
    await loadOrders();
  }

  if (!authed) {
    return (
      <div className="admin-shell flex min-h-dvh items-center justify-center px-5">
        <form onSubmit={login} className="admin-card w-full max-w-sm space-y-4">
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            Cocina
          </h1>
          <p className="text-sm text-white/50">Comandas en vivo RestXperience</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-glass"
            placeholder="Contraseña de cocina"
            autoFocus
          />
          {message && <p className="text-sm text-red-300">{message}</p>}
          <button type="submit" className="btn-primary w-full">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-dvh px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] text-[#c4a574]/70 uppercase">
              Cocina
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
              Comandas activas
            </h1>
            <p className="mt-1 text-sm text-white/45">
              Marca servido cuando el mozo pueda llevar el pedido a la mesa.
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={async () => {
              await fetch("/api/kitchen/login", { method: "DELETE" });
              setAuthed(false);
            }}
          >
            Salir
          </button>
        </div>

        {message && (
          <p className="mb-4 rounded-xl bg-white/10 px-3 py-2 text-sm text-[#e8d5b5]">
            {message}
          </p>
        )}

        {!orders.length && (
          <div className="admin-card py-16 text-center">
            <p className="font-[family-name:var(--font-display)] text-2xl text-white/70">
              Sin comandas pendientes
            </p>
            <p className="mt-2 text-sm text-white/40">
              Los pedidos pagados aparecerán aquí automáticamente.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {orders.map((o) => (
            <article
              key={o.id}
              className="admin-card border-[#c4a574]/30 ring-1 ring-[#c4a574]/15"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-3xl text-[#e8d5b5]">
                    {o.session.table.label}
                  </p>
                  <p className="text-xs text-white/40">
                    Mesa {o.session.table.number} · hace{" "}
                    {elapsedSince(o.paidAt || o.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-[#c4a574]/20 px-3 py-1 text-xs text-[#e8d5b5]">
                  En cocina
                </span>
              </div>

              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {o.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-baseline justify-between gap-2 text-lg text-white"
                  >
                    <span>
                      <span className="font-semibold text-[#c4a574]">
                        {item.quantity}×
                      </span>{" "}
                      {item.name}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="btn-primary mt-5 w-full py-3 text-base"
                disabled={busyId === o.id}
                onClick={() => void markServed(o.id)}
              >
                {busyId === o.id ? "Marcando…" : "Marcar servido — llevar a mesa"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
