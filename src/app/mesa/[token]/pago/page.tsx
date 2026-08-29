import { Suspense } from "react";
import { PaymentReturn } from "@/components/payment-return";

export const dynamic = "force-dynamic";

export default async function PagoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-white/50">
          Cargando…
        </div>
      }
    >
      <PaymentReturn tableToken={token} />
    </Suspense>
  );
}
