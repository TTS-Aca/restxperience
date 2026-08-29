import { prisma } from "./db";
import { sendToSoftRestaurant } from "./softrestaurant";

/**
 * Tras pago confirmado: marca orden pagada y ENVÍA la comanda a mesa/cocina.
 * Sin pago previo esta función no debe llamarse.
 */
export async function fulfillPaidOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      session: { include: { table: true } },
    },
  });

  if (!order) {
    return { ok: false as const, error: "Orden no encontrada" };
  }

  if (order.comandaSent && order.status === "paid") {
    return { ok: true as const, order, already: true };
  }

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  let softRestaurantId = order.softRestaurantId || undefined;

  // SoftRestaurant: reenviar comanda solo después del pago
  if (settings?.commerceMode === "softrestaurant") {
    const result = await sendToSoftRestaurant(
      {
        orderId: order.id,
        tableNumber: order.session.table.number,
        tableLabel: order.session.table.label,
        total: order.total,
        guestEmail: order.guestEmail,
        items: order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      },
      settings.softRestaurantEndpoint
    );
    if (!result.ok) {
      return { ok: false as const, error: result.message };
    }
    softRestaurantId = result.externalId;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "paid",
      comandaSent: true,
      softRestaurantId,
      paidAt: new Date(),
    },
    include: {
      items: true,
      session: { include: { table: true } },
    },
  });

  await prisma.session.update({
    where: { id: order.sessionId },
    data: { status: "paid" },
  });

  return { ok: true as const, order: updated, already: false };
}
