import { NextResponse } from "next/server";
import { fulfillPaidOrder } from "@/lib/fulfill";
import { prisma } from "@/lib/db";
import { verifyStripeSession } from "@/lib/stripe";

/**
 * Confirma el pago y recién entonces envía la comanda a la mesa.
 * - Stripe real: session_id de Checkout
 * - Demo: orderId (sin llaves Stripe)
 */
export async function POST(req: Request) {
  const body = await req.json();
  const orderId = String(body.orderId || "");
  const stripeSessionId = body.stripeSessionId
    ? String(body.stripeSessionId)
    : undefined;
  const demo = Boolean(body.demo);

  if (!orderId) {
    return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  if (order.status === "paid" && order.comandaSent) {
    return NextResponse.json({
      ok: true,
      already: true,
      orderId: order.id,
      status: order.status,
      comandaSent: true,
    });
  }

  if (order.status === "cancelled") {
    return NextResponse.json({ error: "Orden cancelada" }, { status: 400 });
  }

  if (stripeSessionId) {
    const verified = await verifyStripeSession(stripeSessionId);
    if (!verified.paid) {
      return NextResponse.json(
        { error: "El pago de Stripe aún no está confirmado." },
        { status: 402 }
      );
    }
  } else if (!demo) {
    return NextResponse.json(
      { error: "Falta confirmación de pago (Stripe o demo)." },
      { status: 400 }
    );
  }

  const result = await fulfillPaidOrder(orderId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    orderId: result.order.id,
    status: result.order.status,
    comandaSent: result.order.comandaSent,
    table: result.order.session.table.label,
    message:
      "Pago confirmado. La comanda ya fue enviada a tu mesa.",
  });
}
