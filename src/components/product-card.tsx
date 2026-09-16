"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "./cart-provider";

export type ProductOpinion = {
  stars: number;
  comment: string;
  createdAt: string;
};

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
  recentOpinions: ProductOpinion[];
};

export function ProductCard({
  product,
  currency,
  orderingEnabled = true,
}: {
  product: MenuProduct;
  currency: string;
  orderingEnabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [opinions, setOpinions] = useState(product.recentOpinions);
  const [showOpinions, setShowOpinions] = useState(false);
  const [loadingOpinions, setLoadingOpinions] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setOpinions(product.recentOpinions);
  }, [product.recentOpinions]);

  async function loadOpinions() {
    if (loadingOpinions) return;
    setLoadingOpinions(true);
    try {
      const res = await fetch(
        `/api/ratings?productId=${encodeURIComponent(product.id)}&limit=3`
      );
      if (res.ok) {
        const data = await res.json();
        setOpinions(data.opinions || []);
      }
    } finally {
      setLoadingOpinions(false);
    }
  }

  async function toggleOpinions() {
    const next = !showOpinions;
    setShowOpinions(next);
    if (next && !opinions.length) await loadOpinions();
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
          <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2">
            <h3 className="min-w-0 font-[family-name:var(--font-display)] text-lg leading-tight text-white drop-shadow sm:text-xl">
              {product.name}
            </h3>
            <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md sm:px-3 sm:text-sm">
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
              <button
                type="button"
                onClick={() => void toggleOpinions()}
                className="text-xs tracking-wide text-[#c4a574] uppercase"
              >
                {showOpinions ? "Ocultar opiniones" : "Ver opiniones recientes"}
              </button>
              {showOpinions && (
                <div className="mt-3 space-y-2">
                  {loadingOpinions && (
                    <p className="text-xs text-white/40">Cargando…</p>
                  )}
                  {!loadingOpinions && !opinions.length && (
                    <p className="text-xs text-white/40">
                      Aún no hay opiniones para este platillo.
                    </p>
                  )}
                  {opinions.map((opinion, i) => (
                    <article
                      key={`${opinion.createdAt}-${i}`}
                      className="rounded-xl border border-white/8 bg-white/4 p-3"
                    >
                      <div className="mb-1 flex gap-0.5 text-[#c4a574]">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`h-3 w-3 ${
                              j < opinion.stars
                                ? "fill-current"
                                : "opacity-30"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-white/75">{opinion.comment}</p>
                      <p className="mt-1 text-[10px] text-white/30">
                        {new Date(opinion.createdAt).toLocaleDateString("es-MX")}
                      </p>
                    </article>
                  ))}
                </div>
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
