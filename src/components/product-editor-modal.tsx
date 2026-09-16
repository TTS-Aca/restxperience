"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type EditableProduct = {
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

type ProductEditorModalProps = {
  open: boolean;
  creating: boolean;
  product: EditableProduct;
  categories: { id: string; name: string }[];
  busy: boolean;
  uploading: "image" | "video" | null;
  onClose: () => void;
  onChange: (product: EditableProduct) => void;
  onSave: (e: React.FormEvent) => void;
  onDelete: () => void;
  onUpload: (file: File, kind: "image" | "video") => Promise<string | null>;
};

export function ProductEditorModal({
  open,
  creating,
  product,
  categories,
  busy,
  uploading,
  onClose,
  onChange,
  onSave,
  onDelete,
  onUpload,
}: ProductEditorModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        className="flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-[#c4a574]/35 bg-[#161310] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-editor-title"
        onSubmit={onSave}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs tracking-[0.2em] text-[#c4a574]/70 uppercase">
              {creating ? "Alta" : "Edición"}
            </p>
            <h2
              id="product-editor-title"
              className="truncate font-[family-name:var(--font-display)] text-2xl text-white"
            >
              {creating ? "Nuevo producto" : product.name || "Producto"}
            </h2>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl leading-none text-white/70 transition hover:bg-white/10"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {!creating && !product.available && (
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
              Oculto en menú
            </span>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-white/40 uppercase sm:col-span-2">
              Categoría
              <select
                className="input-glass mt-1"
                value={product.categoryId}
                onChange={(e) =>
                  onChange({ ...product, categoryId: e.target.value })
                }
                required
              >
                <option value="">Selecciona…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-white/40 uppercase sm:col-span-2">
              Nombre
              <input
                className="input-glass mt-1"
                value={product.name}
                onChange={(e) =>
                  onChange({ ...product, name: e.target.value })
                }
                required
                autoFocus
              />
            </label>

            <label className="block text-xs text-white/40 uppercase">
              Precio
              <input
                type="number"
                step="0.01"
                min={0}
                className="input-glass mt-1"
                value={product.price}
                onChange={(e) =>
                  onChange({ ...product, price: Number(e.target.value) })
                }
              />
            </label>

            <label className="block text-xs text-white/40 uppercase">
              Calorías
              <input
                type="number"
                min={0}
                className="input-glass mt-1"
                placeholder="Opcional"
                value={product.calories ?? ""}
                onChange={(e) =>
                  onChange({
                    ...product,
                    calories:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </label>
          </div>

          <label className="block text-xs text-white/40 uppercase">
            Descripción
            <textarea
              className="input-glass mt-1"
              rows={2}
              value={product.description}
              onChange={(e) =>
                onChange({ ...product, description: e.target.value })
              }
            />
          </label>

          <label className="block text-xs text-white/40 uppercase">
            Ingredientes
            <textarea
              className="input-glass mt-1"
              rows={2}
              value={product.ingredients}
              onChange={(e) =>
                onChange({ ...product, ingredients: e.target.value })
              }
            />
          </label>

          <div className="space-y-2 rounded-xl border border-white/10 p-3">
            <p className="text-xs tracking-wide text-white/40 uppercase">
              Imagen
            </p>
            {product.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt="Vista previa"
                className="h-28 w-full rounded-lg object-cover"
              />
            )}
            <div className="flex flex-wrap gap-2">
              <label className="btn-ghost cursor-pointer text-sm">
                {uploading === "image" ? "Subiendo…" : "Subir imagen"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={!!uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await onUpload(file, "image");
                    if (url) onChange({ ...product, imageUrl: url });
                    e.target.value = "";
                  }}
                />
              </label>
              {product.imageUrl && (
                <button
                  type="button"
                  className="btn-ghost text-sm"
                  onClick={() => onChange({ ...product, imageUrl: null })}
                >
                  Quitar
                </button>
              )}
            </div>
            <input
              className="input-glass"
              placeholder="O pegar URL"
              value={product.imageUrl || ""}
              onChange={(e) =>
                onChange({
                  ...product,
                  imageUrl: e.target.value || null,
                })
              }
            />
          </div>

          <div className="space-y-2 rounded-xl border border-white/10 p-3">
            <p className="text-xs tracking-wide text-white/40 uppercase">
              Video
            </p>
            <p className="text-xs text-white/45">
              Solo videos cortos de 15 a 35 segundos.
            </p>
            {product.videoUrl && (
              <video
                src={product.videoUrl}
                controls
                className="max-h-36 w-full rounded-lg bg-black/40"
              />
            )}
            <div className="flex flex-wrap gap-2">
              <label className="btn-ghost cursor-pointer text-sm">
                {uploading === "video" ? "Subiendo…" : "Subir video"}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  disabled={!!uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await onUpload(file, "video");
                    if (url) onChange({ ...product, videoUrl: url });
                    e.target.value = "";
                  }}
                />
              </label>
              {product.videoUrl && (
                <button
                  type="button"
                  className="btn-ghost text-sm"
                  onClick={() => onChange({ ...product, videoUrl: null })}
                >
                  Quitar
                </button>
              )}
            </div>
            <input
              className="input-glass"
              placeholder="O pegar URL"
              value={product.videoUrl || ""}
              onChange={(e) =>
                onChange({
                  ...product,
                  videoUrl: e.target.value || null,
                })
              }
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={product.available}
              onChange={(e) =>
                onChange({ ...product, available: e.target.checked })
              }
            />
            Visible en el menú
          </label>
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-[#12100e] px-4 py-3">
          <button type="submit" className="btn-primary" disabled={busy}>
            {creating ? "Crear producto" : "Guardar"}
          </button>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          {!creating && (
            <button
              type="button"
              className="btn-ghost ml-auto text-red-300/90"
              disabled={busy}
              onClick={onDelete}
            >
              Eliminar
            </button>
          )}
        </footer>
      </form>
    </div>,
    document.body
  );
}
