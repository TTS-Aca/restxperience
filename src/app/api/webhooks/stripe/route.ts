import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { fulfillPaidOrder } from "@/lib/fulfill";
import { prisma } from "@/lib/db";
import {
  checkoutSessionOrderId,
  constructStripeWebhookEvent,
  webhookConfigured,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fuente de verdad del cobro. Stripe reintenta si respondemos 5xx.
 * Eventos: checkout.session.completed | async_payment_succeeded | expired.
 */
export async function POST(req: Request) {
  if (!webhookConfigured()) {
    return NextResponse.json(
      { error: "Webhook Stripe no configurado" },
      { status: 503 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Firma ausente" }, { status: 400 });
  }

  let event;
  try {
    event = await constructStripeWebhookEvent(await req.text(), signature);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = checkoutSessionOrderId(session);

    if (!orderId) {
      return NextResponse.json({ received: true, skipped: "sin orderId" });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, skipped: "aún no pagado" });
    }

    await prisma.order.updateMany({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    });

    const result = await fulfillPaidOrder(orderId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      received: true,
      orderId,
      already: result.already,
    });
  }

  if (
    event.type === "checkout.session.expired" ||
    event.type === "checkout.session.async_payment_failed"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = checkoutSessionOrderId(session);
    if (orderId) {
      await prisma.order.updateMany({
        where: { id: orderId, status: "pending_payment", comandaSent: false },
        data: { status: "cancelled" },
      });
    }
    return NextResponse.json({ received: true, cancelled: Boolean(orderId) });
  }

  return NextResponse.json({ received: true });
}
