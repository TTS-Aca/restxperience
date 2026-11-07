"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { ProductEditorModal } from "@/components/product-editor-modal";
import { MENU_CSV_TEMPLATE } from "@/lib/menu-csv";
import {
  getVideoDurationFromFile,
  isVideoDurationAllowed,
  videoDurationError,
} from "@/lib/video-duration";

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: "pago pendiente",
  paid: "pagado",
  cancelled: "cancelado",
};

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
  currency: string;
};

type Order = {
  id: string;
  status: string;
  total: number;
  paymentMode: string;
  comandaSent: boolean;
  softRestaurantId: string | null;
  createdAt: string;
  servedAt: string | null;
  guestEmail: string | null;
  items: { name: string; quantity: number; unitPrice: number }[];
  session: { table: { label: string; number: number } };
};

type Analytics = {
  today: { revenue: number; orderCount: number; avgTicket: number };
  week: { revenue: number; orderCount: number; avgTicket: number };
  month: { revenue: number; orderCount: number; avgTicket: number };
  topProducts: { name: string; quantity: number; revenue: number }[];
  recentOrders: {
    id: string;
    total: number;
    tableLabel: string;
    paidAt: string | null;
    servedAt: string | null;
    itemCount: number;
  }[];
};

export function AdminPanel({ origin }: { origin: string }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<
    "summary" | "orders" | "products" | "tables" | "settings"
  >("summary");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [tableLabel, setTableLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);

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
    setAnalytics(data.analytics);
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

  useEffect(() => {
    if (!editing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditing(null);
        setCreating(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [editing]);

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

  async function patch(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/data", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "No se pudo guardar");
      return false;
    }
    return true;
  }

  function blankProduct(categoryId = categories[0]?.id || ""): Product {
    return {
      id: "",
      name: "",
      price: 0,
      description: "",
      ingredients: "",
      calories: null,
      imageUrl: null,
      videoUrl: null,
      available: true,
      categoryId,
      category: { name: "" },
    };
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    const ok = creating
      ? await patch({ type: "product-create", ...editing })
      : await patch({ type: "product", ...editing });
    setBusy(false);
    if (ok) {
      setMessage(creating ? "Producto creado" : "Producto actualizado");
      closeEditor();
      await load();
    }
  }

  async function uploadMedia(file: File, kind: "image" | "video") {
    setUploading(kind);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);

      if (kind === "video") {
        let duration: number;
        try {
          duration = await getVideoDurationFromFile(file);
        } catch {
          setMessage("No se pudo leer la duración del video.");
          return null;
        }
        if (!isVideoDurationAllowed(duration)) {
          setMessage(videoDurationError());
          return null;
        }
        formData.append("duration", String(duration));
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "No se pudo subir el archivo");
        return null;
      }
      setMessage(kind === "video" ? "Video subido" : "Imagen subida");
      return data.url as string;
    } finally {
      setUploading(null);
    }
  }

  function selectProduct(p: Product) {
    setCreating(false);
    setEditing({ ...p });
  }

  function startCreateProduct() {
    setCreating(true);
    setEditing(blankProduct());
  }

  function closeEditor() {
    setEditing(null);
    setCreating(false);
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await patch({ type: "category-create", name: newCategory });
    setBusy(false);
    if (ok) {
      setMessage("Categoría creada");
      setNewCategory("");
      await load();
    }
  }

  async function createTable(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await patch({
      type: "table-create",
      number: tableNumber ? Number(tableNumber) : undefined,
      label: tableLabel,
    });
    setBusy(false);
    if (ok) {
      setMessage("Mesa creada");
      setTableNumber("");
      setTableLabel("");
      await load();
    }
  }

  async function createDemoTables() {
    setBusy(true);
    let created = 0;
    for (let n = 1; n <= 8; n++) {
      if (tables.some((t) => t.number === n)) continue;
      const ok = await patch({
        type: "table-create",
        number: n,
        label: `Mesa ${n}`,
      });
      if (ok) created += 1;
    }
    setBusy(false);
    setMessage(created ? `Se crearon ${created} mesas` : "Esas mesas ya existen");
    await load();
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
              ["summary", "Resumen"],
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

        {tab === "summary" && analytics && settings && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["Hoy", analytics.today],
                  ["7 días", analytics.week],
                  ["30 días", analytics.month],
                ] as const
              ).map(([label, stats]) => (
                <article key={label} className="admin-card">
                  <p className="text-xs tracking-wide text-white/40 uppercase">
                    {label}
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[#e8d5b5]">
                    {formatPrice(stats.revenue, settings.currency)}
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    {stats.orderCount} pedidos · ticket{" "}
                    {formatPrice(stats.avgTicket, settings.currency)}
                  </p>
                </article>
              ))}
            </div>

            {analytics.topProducts.length > 0 && (
              <article className="admin-card">
                <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl text-white">
                  Platillos más vendidos (30 días)
                </h2>
                <ul className="space-y-2">
                  {analytics.topProducts.map((p) => (
                    <li
                      key={p.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-white/80">
                        {p.name}{" "}
                        <span className="text-white/40">×{p.quantity}</span>
                      </span>
                      <span className="text-[#c4a574]">
                        {formatPrice(p.revenue, settings.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {analytics.recentOrders.length > 0 && (
              <article className="admin-card">
                <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl text-white">
                  Pedidos recientes
                </h2>
                <ul className="space-y-2 text-sm">
                  {analytics.recentOrders.map((o) => (
                    <li
                      key={o.id}
                      className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2 last:border-0"
                    >
                      <span className="text-white/80">
                        {o.tableLabel} · {o.itemCount} platillos
                        {o.servedAt ? " · servido" : " · en cocina"}
                      </span>
                      <span className="text-[#c4a574]">
                        {formatPrice(o.total, settings.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {!analytics.month.orderCount && (
              <p className="text-white/40">
                Aún no hay ventas registradas. Los ingresos aparecen cuando los
                comensales pagan.
              </p>
            )}
          </div>
        )}

        {tab === "summary" && !analytics && (
          <p className="text-white/40">Cargando resumen…</p>
        )}

        {tab === "orders" && (
          <div className="space-y-3">
            {orders.map((o) => (
              <article key={o.id} className="admin-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">
                      {o.session.table.label} ·{" "}
                      <span className="text-[#c4a574]">
                        {ORDER_STATUS_LABEL[o.status] ?? o.status}
                      </span>
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
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {o.status === "paid" && o.servedAt && (
                    <span className="rounded-full bg-[#c4a574]/15 px-3 py-1 text-xs text-[#e8d5b5]">
                      Servido ·{" "}
                      {new Date(o.servedAt).toLocaleString("es-MX", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                  {o.status === "paid" && !o.servedAt && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/50">
                      En cocina
                    </span>
                  )}
                </div>
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
            <form
              onSubmit={createCategory}
              className="admin-card flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <label className="block min-w-0 flex-1 text-xs tracking-wide text-white/40 uppercase">
                Nueva categoría
                <input
                  className="input-glass mt-1"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ej. Cortes, Bebidas, Postres"
                  required
                />
              </label>
              <button type="submit" className="btn-primary" disabled={busy}>
                Crear categoría
              </button>
            </form>

            <div className="admin-card space-y-3">
              <p className="text-xs tracking-wide text-white/40 uppercase">
                Importar menú CSV
              </p>
              <p className="text-sm text-white/55">
                Fotografía el menú, extrae filas a CSV y súbelo aquí. Después
                solo agregas foto o video a cada platillo. Si el nombre ya
                existe en esa categoría, se actualiza precio y texto; las
                imágenes no se tocan.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-ghost text-sm"
                  onClick={() => {
                    const blob = new Blob([MENU_CSV_TEMPLATE], {
                      type: "text/csv;charset=utf-8",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "menu-restxperience.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Descargar plantilla
                </button>
                <label className="btn-primary cursor-pointer text-sm">
                  {busy ? "Importando…" : "Subir CSV"}
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    disabled={busy}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const csv = await file.text();
                      setBusy(true);
                      const res = await fetch("/api/admin/data", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "menu-csv-import", csv }),
                      });
                      const data = await res.json();
                      setBusy(false);
                      e.target.value = "";
                      if (!res.ok) {
                        setMessage(data.error || "No se pudo importar el CSV");
                        return;
                      }
                      setMessage(
                        `Menú importado: ${data.created} nuevos, ${data.updated} actualizados${
                          data.skipped ? `, ${data.skipped} filas con error` : ""
                        }.`
                      );
                      await load();
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Buscar producto o categoría…"
                className="input-glass max-w-md"
              />
              <button
                type="button"
                className="btn-primary"
                disabled={!categories.length}
                onClick={startCreateProduct}
              >
                Nuevo producto
              </button>
            </div>

            {!categories.length && (
              <p className="text-sm text-white/45">
                Primero crea una categoría. Luego ya puedes agregar platillos.
              </p>
            )}

            {!editing && categories.length > 0 && (
              <p className="text-sm text-white/45">
                Toca un producto para editarlo en la ventana emergente.
              </p>
            )}

            <div className="grid gap-2">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectProduct(p)}
                  className="admin-card flex items-center gap-3 text-left transition hover:bg-white/8"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg text-white/20">◇</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="text-xs text-white/40">
                        {p.category.name}
                        {!p.available ? " · oculto" : ""}
                        {p.videoUrl ? " · video" : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-[#c4a574]">
                        {formatPrice(p.price)}
                      </span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/50">
                        Editar
                      </span>
                    </div>
                  </button>
              ))}
            </div>

            {!products.length && categories.length > 0 && !editing && (
              <p className="text-white/40">Aún no hay productos.</p>
            )}
          </div>
        )}

        {tab === "tables" && (
          <div className="space-y-4">
            <form
              onSubmit={createTable}
              className="admin-card grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end"
            >
              <label className="block text-xs tracking-wide text-white/40 uppercase">
                Número
                <input
                  type="number"
                  min={1}
                  className="input-glass mt-1"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Auto"
                />
              </label>
              <label className="block text-xs tracking-wide text-white/40 uppercase">
                Etiqueta
                <input
                  className="input-glass mt-1"
                  value={tableLabel}
                  onChange={(e) => setTableLabel(e.target.value)}
                  placeholder="Mesa 1"
                />
              </label>
              <button type="submit" className="btn-primary" disabled={busy}>
                Crear mesa
              </button>
            </form>
            <button
              type="button"
              className="btn-ghost"
              disabled={busy}
              onClick={() => void createDemoTables()}
            >
              Crear mesas 1 a 8
            </button>

            {!tables.length && (
              <p className="text-sm text-white/45">
                No hay mesas. Crea una o genera las 8 de demo para ver QR y
                abrir el menú.
              </p>
            )}

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
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost inline-flex text-sm"
                      >
                        Abrir mesa
                      </a>
                      <button
                        type="button"
                        className="btn-ghost text-sm"
                        disabled={busy}
                        onClick={async () => {
                          if (!confirm(`¿Eliminar ${t.label}?`)) return;
                          setBusy(true);
                          const ok = await patch({
                            type: "table-delete",
                            id: t.id,
                          });
                          setBusy(false);
                          if (ok) {
                            setMessage("Mesa eliminada");
                            await load();
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {tab === "settings" && !settings && (
          <p className="text-white/40">Cargando configuración…</p>
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
                concretar se cierran a los 15 minutos. La conexión directa con
                SoftRestaurant se configura por separado; mientras tanto el
                envío se simula.
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

        {editing && (
          <ProductEditorModal
            open
            creating={creating}
            product={editing}
            categories={categories}
            busy={busy}
            uploading={uploading}
            onClose={closeEditor}
            onChange={setEditing}
            onSave={saveProduct}
            onDelete={async () => {
              if (!confirm("¿Eliminar este producto?")) return;
              setBusy(true);
              const ok = await patch({
                type: "product-delete",
                id: editing.id,
              });
              setBusy(false);
              if (ok) {
                closeEditor();
                setMessage("Producto eliminado");
                await load();
              }
            }}
            onUpload={uploadMedia}
          />
        )}
      </div>
    </div>
  );
}
