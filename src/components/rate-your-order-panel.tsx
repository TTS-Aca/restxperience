"use client";

import { Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type RateableProduct = {
  productId: string;
  name: string;
  orderId: string;
};

type ProductRatingState = {
  stars: number;
  comment: string;
  done: boolean;
  busy: boolean;
  error: string | null;
};

export function RateYourOrderPanel({
  sessionId,
  email,
}: {
  sessionId: string;
  email: string | null;
}) {
  const [rateableProducts, setRateableProducts] = useState<RateableProduct[]>(
    []
  );
  const [pendingInKitchen, setPendingInKitchen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<Record<string, ProductRatingState>>({});

  const load = useCallback(async () => {
    if (!email) {
      setRateableProducts([]);
      setPendingInKitchen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/purchases?email=${encodeURIComponent(email)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setRateableProducts(data.rateableProducts || []);
      setPendingInKitchen(Boolean(data.pendingInKitchen));
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    void load();
  }, [load]);

  function getState(productId: string): ProductRatingState {
    return (
      states[productId] ?? {
        stars: 0,
        comment: "",
        done: false,
        busy: false,
        error: null,
      }
    );
  }

  function patchState(productId: string, patch: Partial<ProductRatingState>) {
    setStates((prev) => ({
      ...prev,
      [productId]: { ...getState(productId), ...patch },
    }));
  }

  async function submit(product: RateableProduct) {
    const state = getState(product.productId);
    if (!email) return;

    if (state.stars < 1) {
      patchState(product.productId, {
        error: "Elige cuántas estrellas merece el platillo.",
      });
      return;
    }
    if (!state.comment.trim()) {
      patchState(product.productId, {
        error: "Escribe una opinión para ayudarnos a mejorar.",
      });
      return;
    }

    patchState(product.productId, { busy: true, error: null });
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          productId: product.productId,
          email,
          stars: state.stars,
          comment: state.comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        patchState(product.productId, {
          busy: false,
          error: data.error || "No se pudo enviar tu calificación.",
        });
        return;
      }
      patchState(product.productId, { busy: false, done: true, error: null });
    } catch {
      patchState(product.productId, {
        busy: false,
        error: "Error de conexión.",
      });
    }
  }

  if (!email) {
    return (
      <section className="glass-card p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-white">
          Califica lo que pediste
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Guarda tu correo arriba para poder calificar cuando te sirvan tu
          pedido.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="glass-card p-6">
        <p className="text-sm text-white/45">Cargando tus pedidos…</p>
      </section>
    );
  }

  if (pendingInKitchen && !rateableProducts.length) {
    return (
      <section className="glass-card p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-white">
          Tu pedido está en cocina
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Cuando te lo sirvan en mesa podrás calificar cada platillo aquí.
        </p>
      </section>
    );
  }

  if (!rateableProducts.length) {
    return null;
  }

  return (
    <section className="glass-card space-y-5 p-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-white">
          Califica lo que pediste
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Cuéntanos qué te pareció cada platillo. Solo puedes calificar lo que ya
          te sirvieron.
        </p>
        {pendingInKitchen && (
          <p className="mt-2 text-sm text-white/45">
            Aún hay platillos en cocina. Podrás calificarlos cuando te los
            sirvan.
          </p>
        )}
      </div>

      {rateableProducts.map((product) => {
        const state = getState(product.productId);
        if (state.done) {
          return (
            <article
              key={product.productId}
              className="rounded-xl border border-[#c4a574]/20 bg-[#c4a574]/5 p-4"
            >
              <p className="font-medium text-white">{product.name}</p>
              <p className="mt-1 text-xs text-[#c4a574]">
                ¡Gracias! Tu opinión quedó registrada.
              </p>
            </article>
          );
        }

        return (
          <article
            key={product.productId}
            className="space-y-3 rounded-xl border border-white/10 p-4"
          >
            <p className="font-medium text-white">{product.name}</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={state.busy}
                    onClick={() =>
                      patchState(product.productId, { stars: value })
                    }
                    aria-label={`${value} estrellas`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        value <= state.stars
                          ? "fill-[#c4a574] text-[#c4a574]"
                          : "text-white/25"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <textarea
              value={state.comment}
              onChange={(e) =>
                patchState(product.productId, { comment: e.target.value })
              }
              rows={2}
              placeholder="¿Qué te pareció? Cuéntanos tu experiencia…"
              className="input-glass resize-none text-sm"
            />
            {state.error && (
              <p className="text-xs text-red-300">{state.error}</p>
            )}
            <button
              type="button"
              disabled={state.busy}
              className="btn-primary text-sm"
              onClick={() => void submit(product)}
            >
              {state.busy ? "Enviando…" : "Enviar calificación"}
            </button>
          </article>
        );
      })}
    </section>
  );
}
