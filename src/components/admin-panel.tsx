"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  ingredients: string;
  calories: number | null;
  imageUrl: string | null;
  videoUrl: string | null;
  available: boolean;
  categoryId: string;
  category: { name: string };
};

type Table = {
  id: string;
  number: number;
  label: string;
  token: string;
};

type Settings = {
  restaurantName: string;
  tagline: string;
  welcomeMessage: string;
  commerceMode: "menu_only" | "stripe" | "softrestaurant";
  softRestaurantEndpoint: string | null;
  dishOfDayId: string | null;
};

type Order = {
  id: string;
  status: string;
  total: number;
  paymentMode: string;
  comandaSent: boolean;
  softRestaurantId: string | null;
  createdAt: string;
  guestEmail: string | null;
  items: { name: string; quantity: number; unitPrice: number }[];
  session: { table: { label: string; number: number } };
};

export function AdminPanel({ origin }: { origin: string }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"settings" | "products" | "tables" | "orders">(
    "orders"
  );
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/data");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setAuthed(true);
    setSettings(data.settings);
    setProducts(data.products);
    setTables(data.tables);
    setOrders(data.orders);
    setCategories(data.categories);
  }, []);

  useEffect(() => {
    void fetch("/api/admin/login")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setAuthed(true);
          void load();
        }
      });
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setMessage("Contraseña incorrecta");
      return;
    }
    setMessage(null);
    await load();
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    const res = await fetch("/api/admin/data", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "settings", ...settings }),
    });
    if (res.ok) setMessage("Configuración guardada");
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await fetch("/api/admin/data", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "product", ...editing }),
    });
    if (res.ok) {
      setMessage("Producto actualizado");
      setEditing(null);
      await load();
    }
  }

  if (!authed) {
    return (
      <div className="admin-shell flex min-h-dvh items-center justify-center px-5">
        <form onSubmit={login} className="admin-card w-full max-w-sm space-y-4">
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            Acceso
          </h1>
          <p className="text-sm text-white/50">Panel secreto RestXperience</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-glass"
            placeholder="Contraseña"
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

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.category.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="admin-shell px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] text-[#c4a574]/70 uppercase">
              Panel secreto
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
              {settings?.restaurantName || "RestXperience"}
            </h1>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={async () => {
              await fetch("/api/admin/login", { method: "DELETE" });
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

        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["orders", "Pedidos"],
              ["products", "Productos"],
              ["tables", "Mesas / QR"],
              ["settings", "Configuración"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-sm ${
                tab === id ? "bg-white/15 text-white" : "bg-white/5 text-white/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "orders" && (
          <div className="space-y-3">
            {orders.map((o) => (
              <article key={o.id} className="admin-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">
                      {o.session.table.label} ·{" "}
                      <span className="text-[#c4a574]">{o.status}</span>
                      {o.comandaSent ? " · comanda enviada" : " · sin comanda"}
                    </p>
                    <p className="text-xs text-white/40">
                      {new Date(o.createdAt).toLocaleString("es-MX")} ·{" "}
                      {o.guestEmail || "sin correo"} · pago: {o.paymentMode}
                    </p>
                  </div>
                  <p className="font-[family-name:var(--font-display)] text-xl">
                    {formatPrice(o.total)}
                  </p>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-white/70">
                  {o.items.map((item, i) => (
                    <li key={i}>
                      {item.quantity}× {item.name} — {formatPrice(item.unitPrice)}
                    </li>
                  ))}
                </ul>
                {o.softRestaurantId && (
                  <p className="mt-2 text-xs text-white/40">
                    SoftRestaurant: {o.softRestaurantId}
                  </p>
                )}
              </article>
            ))}
            {!orders.length && (
              <p className="text-white/40">Aún no hay pedidos.</p>
            )}
          </div>
        )}

        {tab === "products" && (
          <div className="space-y-4">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar producto o categoría…"
              className="input-glass max-w-md"
            />
            <div className="grid gap-2">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setEditing(p)}
                  className="admin-card flex items-center justify-between gap-3 text-left transition hover:bg-white/8"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-white/40">
                      {p.category.name}
                      {!p.available ? " · oculto" : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-[#c4a574]">
                    {formatPrice(p.price)}
                  </span>
                </button>
              ))}
            </div>

            {editing && (
              <form
                onSubmit={saveProduct}
                className="admin-card sticky bottom-4 space-y-3 border-[#c4a574]/30"
              >
                <h3 className="font-[family-name:var(--font-display)] text-2xl">
                  Editar producto
                </h3>
                <input
                  className="input-glass"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  className="input-glass"
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({ ...editing, price: Number(e.target.value) })
                  }
                />
                <textarea
                  className="input-glass"
                  rows={2}
                  placeholder="Descripción"
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
                <textarea
                  className="input-glass"
                  rows={2}
                  placeholder="Ingredientes"
                  value={editing.ingredients}
                  onChange={(e) =>
                    setEditing({ ...editing, ingredients: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="input-glass"
                  placeholder="Calorías"
                  value={editing.calories ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      calories:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
                <input
                  className="input-glass"
                  placeholder="URL imagen"
                  value={editing.imageUrl || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, imageUrl: e.target.value })
                  }
                />
                <input
                  className="input-glass"
                  placeholder="URL video"
                  value={editing.videoUrl || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, videoUrl: e.target.value })
                  }
                />
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={editing.available}
                    onChange={(e) =>
                      setEditing({ ...editing, available: e.target.checked })
                    }
                  />
                  Disponible en menú
                </label>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setEditing(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {tab === "tables" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((t) => {
              const url = `${origin}/mesa/${t.token}`;
              const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
              return (
                <article key={t.id} className="admin-card text-center">
                  <p className="font-[family-name:var(--font-display)] text-2xl">
                    {t.label}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qr}
                    alt={`QR ${t.label}`}
                    className="mx-auto mt-3 rounded-xl bg-white p-2"
                    width={180}
                    height={180}
                  />
                  <p className="mt-3 break-all text-xs text-white/40">{url}</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost mt-3 inline-flex text-sm"
                  >
                    Abrir mesa
                  </a>
                </article>
              );
            })}
          </div>
        )}

        {tab === "settings" && settings && (
          <form onSubmit={saveSettings} className="admin-card max-w-xl space-y-4">
            <label className="block text-xs tracking-wide text-white/40 uppercase">
              Nombre del restaurante
              <input
                className="input-glass mt-1"
                value={settings.restaurantName}
                onChange={(e) =>
                  setSettings({ ...settings, restaurantName: e.target.value })
                }
              />
            </label>
            <label className="block text-xs tracking-wide text-white/40 uppercase">
              Tagline
              <input
                className="input-glass mt-1"
                value={settings.tagline}
                onChange={(e) =>
                  setSettings({ ...settings, tagline: e.target.value })
                }
              />
            </label>
            <label className="block text-xs tracking-wide text-white/40 uppercase">
              Mensaje de bienvenida
              <textarea
                className="input-glass mt-1"
                rows={3}
                value={settings.welcomeMessage}
                onChange={(e) =>
                  setSettings({ ...settings, welcomeMessage: e.target.value })
                }
              />
            </label>
            <label className="block text-xs tracking-wide text-white/40 uppercase">
              Comida del día
              <select
                className="input-glass mt-1"
                value={settings.dishOfDayId || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dishOfDayId: e.target.value || null,
                  })
                }
              >
                <option value="">— Ninguno —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-3 rounded-xl border border-white/10 p-4">
              <p className="text-sm font-medium text-white">
                Modo de comercio
              </p>
              <select
                className="input-glass"
                value={settings.commerceMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    commerceMode: e.target.value as Settings["commerceMode"],
                  })
                }
              >
                <option value="stripe">
                  Stripe — pago primero, luego comanda
                </option>
                <option value="softrestaurant">
                  SoftRestaurant — pago primero, luego POS/comanda
                </option>
                <option value="menu_only">
                  Solo menú — sin carrito ni pedidos
                </option>
              </select>

              {settings.commerceMode === "softrestaurant" && (
                <input
                  className="input-glass"
                  placeholder="Endpoint SoftRestaurant (opcional por ahora)"
                  value={settings.softRestaurantEndpoint || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      softRestaurantEndpoint: e.target.value,
                    })
                  }
                />
              )}

              <p className="text-xs leading-relaxed text-white/40">
                En Stripe y SoftRestaurant la comanda solo se libera cuando el
                pago confirma. Sin pago no llega nada a la mesa. Sesiones sin
                concretar se cierran a los 15 minutos. SoftRestaurant: endpoint
                pendiente de investigar; mientras el stub simula el envío.
              </p>
            </div>

            <p className="text-xs text-white/30">
              Categorías cargadas: {categories.length}
            </p>

            <button type="submit" className="btn-primary">
              Guardar configuración
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
