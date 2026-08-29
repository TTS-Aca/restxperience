"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { CommerceMode } from "@/lib/commerce";
import { formatPrice } from "@/lib/utils";
import { useCart } from "./cart-provider";

export function CartDrawer({
  currency,
  commerceMode,
  tableToken,
  sessionId,
  guestEmail,
  expiresAt,
  onOrderPlaced,
}: {
  currency: string;
  commerceMode: CommerceMode;
  tableToken: string;
  sessionId: string;
  guestEmail?: string | null;
  expiresAt?: string | null;
  onOrderPlaced?: () => void;
}) {
  const { items, total, count, setQuantity, removeItem, clear } = useCart();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(guestEmail || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function payFirst() {
    if (!items.length) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          tableToken,
          email: email || undefined,
          origin: window.location.origin,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "No se pudo iniciar el pago.");
        return;
      }

      // Orden queda pending_payment; comanda NO se envía hasta confirmar pago
      if (data.checkoutUrl) {
        setMessage(
          data.checkoutMode === "demo"
            ? "Modo demo: te llevamos a confirmar el pago. La comanda solo sale si confirmas."
            : "Redirigiendo a Stripe…"
        );
        clear();
        onOrderPlaced?.();
        window.location.href = data.checkoutUrl;
        return;
      }

      setMessage("No se obtuvo URL de checkout.");
    } catch {
      setMessage("Error de conexión. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  const modeLabel =
    commerceMode === "softrestaurant"
      ? "Pagar y enviar comanda (SoftRestaurant)"
      : "Pagar y enviar a mi mesa";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cart-fab"
        aria-label="Abrir carrito"
      >
        <ShoppingBag className="h-5 w-5" />
        {count > 0 && <span className="cart-badge">{count}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="glass-sheet fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl p-5"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-white">
                  Tu pedido
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-white/10 p-2"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {expiresAt && (
                <p className="mb-3 text-xs text-white/40">
                  Sesión válida hasta{" "}
                  {new Date(expiresAt).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  (se cierra a los 15 min sin pago)
                </p>
              )}

              {!items.length ? (
                <p className="py-8 text-center text-white/50">
                  Aún no hay productos. Explora el menú y agrega lo que se te antoje.
                </p>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.productId}
                      className="flex items-center gap-3 rounded-2xl bg-white/5 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-white/50">
                          {formatPrice(item.price, currency)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-full p-2 text-white/40"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                <label className="block text-xs tracking-wide text-white/40 uppercase">
                  Correo (opcional, para tu sesión y reseña)
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="input-glass mt-1"
                  />
                </label>

                <div className="flex items-center justify-between text-white">
                  <span className="text-white/60">Total</span>
                  <span className="font-[family-name:var(--font-display)] text-2xl">
                    {formatPrice(total, currency)}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-white/45">
                  Regla del restaurante: primero se paga, después se envía la
                  comanda a tu mesa. Sin pago no llega nada a cocina.
                </p>

                {message && (
                  <p className="rounded-xl bg-white/10 px-3 py-2 text-sm text-[#e8d5b5]">
                    {message}
                  </p>
                )}

                <button
                  type="button"
                  disabled={!items.length || busy}
                  onClick={() => void payFirst()}
                  className="btn-primary w-full disabled:opacity-40"
                >
                  {busy ? "Abriendo pago…" : modeLabel}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
