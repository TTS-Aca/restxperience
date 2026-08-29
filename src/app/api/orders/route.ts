import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendToSoftRestaurant } from "@/lib/softrestaurant";

export async function POST(req: Request) {
  const body = await req.json();
  const sessionId = String(body.sessionId || "");
  const tableToken = String(body.tableToken || "");
  const email = body.email
    ? String(body.email).trim().toLowerCase()
    : undefined;
  const pay = Boolean(body.pay);
  const items = Array.isArray(body.items) ? body.items : [];

  if (!sessionId || !tableToken || !items.length) {
    return NextResponse.json({ error: "Pedido incompleto" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { table: true },
  });

  if (!session || session.table.token !== tableToken) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 400 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (pay && !settings?.paymentEnabled) {
    return NextResponse.json(
      { error: "El módulo de pago no está activo." },
      { status: 400 }
    );
  }

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

  let paymentMode = "none";
  let status = "sent";
  let softRestaurantId: string | undefined;

  if (pay && settings?.paymentEnabled) {
    paymentMode = settings.softRestaurantEnabled
      ? "softrestaurant"
      : "simulated";
    status = "paid";

    if (settings.softRestaurantEnabled) {
      const result = await sendToSoftRestaurant(
        {
          orderId: "pending",
          tableNumber: session.table.number,
          tableLabel: session.table.label,
          total,
          guestEmail: email || session.email,
          items: lines.map((l) => ({
            name: l.name,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
        },
        settings.softRestaurantEndpoint
      );

      if (!result.ok) {
        return NextResponse.json({ error: result.message }, { status: 502 });
      }
      softRestaurantId = result.externalId;
    } else {
      const result = await sendToSoftRestaurant({
        orderId: "pending",
        tableNumber: session.table.number,
        tableLabel: session.table.label,
        total,
        guestEmail: email || session.email,
        items: lines.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      });
      softRestaurantId = result.externalId;
    }
  }

  const order = await prisma.order.create({
    data: {
      sessionId,
      status,
      paymentMode,
      total,
      guestEmail: email || session.email,
      softRestaurantId,
      items: {
        create: lines,
      },
    },
  });

  if (email) {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        email,
        status: status === "paid" ? "paid" : session.status,
      },
    });
  } else if (status === "paid") {
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "paid" },
    });
  }

  // Re-send with real order id for SoftRestaurant when endpoint exists
  if (
    pay &&
    settings?.paymentEnabled &&
    settings.softRestaurantEnabled &&
    settings.softRestaurantEndpoint
  ) {
    await sendToSoftRestaurant(
      {
        orderId: order.id,
        tableNumber: session.table.number,
        tableLabel: session.table.label,
        total,
        guestEmail: email || session.email,
        items: lines.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      },
      settings.softRestaurantEndpoint
    );
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    status: order.status,
    softRestaurantId,
  });
}
