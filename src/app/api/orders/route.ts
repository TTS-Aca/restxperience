import { NextResponse } from "next/server";
import { isOrderingEnabled } from "@/lib/commerce";
import { prisma } from "@/lib/db";
import { assertSessionOpen, touchSession } from "@/lib/session";
import { createStripeCheckout } from "@/lib/stripe";

/**
 * Crea orden en pending_payment y abre checkout.
 * La comanda NO se envía aquí — solo tras confirmar pago.
 */
export async function POST(req: Request) {
  const body = await req.json();
  const sessionId = String(body.sessionId || "");
  const tableToken = String(body.tableToken || "");
  const email = body.email
    ? String(body.email).trim().toLowerCase()
    : undefined;
  const items = Array.isArray(body.items) ? body.items : [];
  const origin = String(body.origin || new URL(req.url).origin);

  if (!sessionId || !tableToken || !items.length) {
    return NextResponse.json({ error: "Pedido incompleto" }, { status: 400 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const mode = settings?.commerceMode || "stripe";

  if (!isOrderingEnabled(mode)) {
    return NextResponse.json(
      { error: "Este menú es solo consulta. Los pedidos no están activos." },
      { status: 400 }
    );
  }

  const gate = await assertSessionOpen(sessionId, tableToken);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const { session } = gate;

  const productIds = items.map((i: { productId: string }) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, available: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const lines: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[] = [];

  for (const item of items as { productId: string; quantity: number }[]) {
    const product = productMap.get(item.productId);
    if (!product) continue;
    const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
    lines.push({
      productId: product.id,
      name: product.name,
      quantity,
      unitPrice: product.price,
    });
  }

  if (!lines.length) {
    return NextResponse.json({ error: "Sin productos válidos" }, { status: 400 });
  }

  const total = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);

  if (email) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { email },
    });
  }
  await touchSession(sessionId);

  const order = await prisma.order.create({
    data: {
      sessionId,
      status: "pending_payment",
      paymentMode: mode === "softrestaurant" ? "softrestaurant" : "stripe",
      total,
      guestEmail: email || session.email,
      comandaSent: false,
      items: { create: lines },
    },
  });

  const successUrl = `${origin}/mesa/${tableToken}/pago?ok=1`;
  const cancelUrl = `${origin}/mesa/${tableToken}/pago?cancel=1&orderId=${order.id}`;

  // SoftRestaurant mode: por ahora mismo flujo de cobro (Stripe/demo);
  // la comanda al POS solo ocurre en fulfill tras pago.
  const checkout = await createStripeCheckout({
    orderId: order.id,
    currency: settings?.currency || "MXN",
    lines: lines.map((l) => ({
      name: l.name,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })),
    successUrl,
    cancelUrl,
    customerEmail: email || session.email,
    metadata: {
      tableToken,
      sessionId,
      commerceMode: mode,
    },
  });

  if (checkout.mode === "stripe") {
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkout.stripeSessionId },
    });
    return NextResponse.json({
      ok: true,
      orderId: order.id,
      status: "pending_payment",
      checkoutUrl: checkout.checkoutUrl,
      checkoutMode: "stripe",
    });
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    status: "pending_payment",
    checkoutUrl: checkout.confirmUrl,
    checkoutMode: "demo",
    message:
      "Modo demo: sin STRIPE_SECRET_KEY. Confirma el pago para liberar la comanda.",
  });
}
