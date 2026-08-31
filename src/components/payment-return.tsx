"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

async function confirmPayment(payload: {
  orderId?: string | null;
  stripeSessionId?: string | null;
  demo: boolean;
}) {
  const res = await fetch("/api/checkout/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: payload.orderId || undefined,
      stripeSessionId: payload.stripeSessionId || undefined,
      demo: payload.demo,
    }),
  });
  const data = await res.json();
  return { res, data };
}

export function PaymentReturn({ tableToken }: { tableToken: string }) {
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "cancel" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Confirmando pago…");

  useEffect(() => {
    const cancel = params.get("cancel");
    const orderId = params.get("orderId");
    const stripeSessionId = params.get("session_id");
    const demo = params.get("demo");

    if (cancel) {
      setStatus("cancel");
      setMessage("Pago cancelado. No se envió ninguna comanda a la mesa.");
      if (orderId) {
        void fetch("/api/orders/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
      }
      return;
    }

    if (!orderId && !stripeSessionId && !demo) {
      setStatus("error");
      setMessage("No hay datos de pago para confirmar.");
      return;
    }

    async function confirm() {
      let resolvedOrderId = orderId;
      if (!resolvedOrderId && demo) {
        try {
          const parsed = JSON.parse(
            atob(demo.replace(/-/g, "+").replace(/_/g, "/"))
          ) as { orderId?: string };
          resolvedOrderId = parsed.orderId || null;
        } catch {
          resolvedOrderId = params.get("orderId");
        }
      }

      if (!resolvedOrderId && !stripeSessionId) {
        setStatus("error");
        setMessage("No se encontró la orden.");
        return;
      }

      try {
        for (let attempt = 0; attempt < 8; attempt++) {
          const { res, data } = await confirmPayment({
            orderId: resolvedOrderId,
            stripeSessionId,
            demo: Boolean(demo) && !stripeSessionId,
          });

          if (res.ok) {
            setStatus("ok");
            setMessage(
              data.message ||
                "Pago confirmado. La comanda ya va camino a tu mesa."
            );
            return;
          }

          if (res.status === 402 && attempt < 7) {
            setMessage("Stripe está confirmando el cobro…");
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }

          setStatus("error");
          setMessage(data.error || "No se pudo confirmar el pago.");
          return;
        }
      } catch {
        setStatus("error");
        setMessage("Error de conexión al confirmar el pago.");
      }
    }

    void confirm();
  }, [params]);

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-10 sm:px-6">
      <div className="atmosphere" />
      <div className="glass-card relative z-10 w-full max-w-md space-y-4 p-6 text-center sm:p-8">
        <p className="text-xs tracking-[0.3em] text-[#c4a574]/80 uppercase">
          Pago
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">
          {status === "loading" && "Procesando…"}
          {status === "ok" && "Listo"}
          {status === "cancel" && "Cancelado"}
          {status === "error" && "Algo falló"}
        </h1>
        <p className="text-sm leading-relaxed text-white/65">{message}</p>
        <Link href={`/mesa/${tableToken}`} className="btn-primary inline-flex">
          Volver al menú
        </Link>
      </div>
    </div>
  );
}
