"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
      try {
        // Demo flow puts orderId in query; Stripe puts session_id
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

        if (!resolvedOrderId) {
          setStatus("error");
          setMessage("No se encontró la orden.");
          return;
        }

        const res = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: resolvedOrderId,
            stripeSessionId: stripeSessionId || undefined,
            demo: Boolean(demo) && !stripeSessionId,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "No se pudo confirmar el pago.");
          return;
        }
        setStatus("ok");
        setMessage(
          data.message ||
            "Pago confirmado. La comanda ya va camino a tu mesa."
        );
      } catch {
        setStatus("error");
        setMessage("Error de conexión al confirmar el pago.");
      }
    }

    void confirm();
  }, [params]);

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-6">
      <div className="atmosphere" />
      <div className="glass-card relative z-10 w-full max-w-md space-y-4 p-8 text-center">
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
