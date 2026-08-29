"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "./cart-provider";

export type MenuProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  ingredients: string;
  calories: number | null;
  imageUrl: string | null;
  videoUrl: string | null;
  avgStars: number;
  ratingCount: number;
};

export function ProductCard({
  product,
  currency,
  guestEmail,
  orderingEnabled = true,
}: {
  product: MenuProduct;
  currency: string;
  guestEmail?: string | null;
  orderingEnabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [rated, setRated] = useState(false);
  const [busy, setBusy] = useState(false);
  const { addItem } = useCart();

  async function submitRating(value: number) {
    if (!guestEmail) {
      alert("Guarda tu correo en la sesión para calificar.");
      return;
    }
    setStars(value);
    setBusy(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          email: guestEmail,
          stars: value,
        }),
      });
      if (res.ok) setRated(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="glass-card overflow-hidden"
    >
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="media-frame relative aspect-[16/10] w-full overflow-hidden">
          {product.videoUrl ? (
            <video
              src={product.videoUrl}
              className="h-full w-full object-cover"
              muted
              loop
              playsInline
              autoPlay
            />
          ) : product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-end bg-gradient-to-br from-[#2a2420] via-[#3d342c] to-[#1a1614] p-4">
              <span className="text-sm tracking-[0.2em] text-white/40 uppercase">
                Próxima imagen
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between gap-3">
            <h3 className="font-[family-name:var(--font-display)] text-xl leading-tight text-white drop-shadow">
              {product.name}
            </h3>
            <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur-md">
              {formatPrice(product.price, currency)}
            </span>
          </div>
        </div>
      </button>

      <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[#c4a574]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.round(product.avgStars)
                    ? "fill-current"
                    : "opacity-30"
                }`}
              />
            ))}
            <span className="ml-1 text-xs text-white/50">
              {product.ratingCount
                ? `${product.avgStars.toFixed(1)} (${product.ratingCount})`
                : "Sin calificar"}
            </span>
          </div>
          {orderingEnabled && (
            <button
              type="button"
              onClick={() =>
                addItem({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl,
                })
              }
              className="btn-primary text-sm"
            >
              Agregar
            </button>
          )}
        </div>

        {product.description && !open && (
          <p className="line-clamp-2 text-sm text-white/60">
            {product.description}
          </p>
        )}

        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 border-t border-white/10 pt-3 text-sm text-white/75"
          >
            {product.description && <p>{product.description}</p>}
            {product.ingredients && (
              <p>
                <span className="text-white/40">Ingredientes: </span>
                {product.ingredients}
              </p>
            )}
            {product.calories != null && (
              <p>
                <span className="text-white/40">Calorías: </span>
                {product.calories} kcal
              </p>
            )}

            <div>
              <p className="mb-2 text-xs tracking-wide text-white/40 uppercase">
                Tu calificación
              </p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = i + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={busy || rated}
                      onClick={() => submitRating(value)}
                      className="p-0.5"
                      aria-label={`${value} estrellas`}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          value <= stars
                            ? "fill-[#c4a574] text-[#c4a574]"
                            : "text-white/30"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              {rated && (
                <p className="mt-1 text-xs text-[#c4a574]">¡Gracias por tu voto!</p>
              )}
            </div>
          </motion.div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs tracking-wide text-white/40 uppercase"
        >
          {open ? "Ocultar detalle" : "Ver detalle"}
        </button>
      </div>
    </motion.article>
  );
}
