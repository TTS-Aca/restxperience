/**
 * SoftRestaurant integration adapter (stub).
 * When payment + SoftRestaurant are enabled in settings,
 * orders are forwarded here after checkout.
 */

export type SoftRestaurantOrderPayload = {
  orderId: string;
  tableNumber: number;
  tableLabel: string;
  total: number;
  guestEmail?: string | null;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export type SoftRestaurantResult = {
  ok: boolean;
  externalId?: string;
  message: string;
};

export async function sendToSoftRestaurant(
  payload: SoftRestaurantOrderPayload,
  endpoint?: string | null
): Promise<SoftRestaurantResult> {
  if (!endpoint) {
    // Simulation mode: log and return a fake ticket id
    console.info("[SoftRestaurant stub]", JSON.stringify(payload, null, 2));
    return {
      ok: true,
      externalId: `SR-SIM-${payload.orderId.slice(0, 8).toUpperCase()}`,
      message: "Orden registrada en modo simulación SoftRestaurant.",
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        message: `SoftRestaurant respondió ${res.status}: ${text}`,
      };
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return {
      ok: true,
      externalId: data.id || `SR-${Date.now()}`,
      message: "Orden enviada a SoftRestaurant.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo contactar SoftRestaurant.",
    };
  }
}
