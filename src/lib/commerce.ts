export const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutos

/** Modos de comercio del restaurante */
export type CommerceMode = "menu_only" | "stripe" | "softrestaurant";

export const COMMERCE_MODES: {
  id: CommerceMode;
  label: string;
  description: string;
}[] = [
  {
    id: "stripe",
    label: "Stripe (pago primero)",
    description:
      "RestXperience cobra con Stripe. Solo cuando el pago confirma se envía la comanda a la mesa.",
  },
  {
    id: "softrestaurant",
    label: "SoftRestaurant",
    description:
      "Pago integrado al POS. Sin pago no hay comanda. Endpoint configurable cuando esté listo.",
  },
  {
    id: "menu_only",
    label: "Solo menú",
    description:
      "Catálogo visual sin carrito ni pedidos. Ideal si el local no quiere integración de pagos.",
  },
];

export function isOrderingEnabled(mode: string | null | undefined) {
  return mode === "stripe" || mode === "softrestaurant";
}

export function isPayFirst(mode: string | null | undefined) {
  return mode === "stripe" || mode === "softrestaurant";
}

export function sessionExpiryDate(from = new Date()) {
  return new Date(from.getTime() + SESSION_TTL_MS);
}

export function isSessionExpired(session: {
  status: string;
  expiresAt?: Date | null;
  createdAt: Date;
}) {
  if (session.status === "closed") return true;
  const limit =
    session.expiresAt ??
    new Date(session.createdAt.getTime() + SESSION_TTL_MS);
  return Date.now() > limit.getTime();
}
