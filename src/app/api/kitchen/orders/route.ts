import { NextResponse } from "next/server";
import { isKitchenAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function guard() {
  if (!(await isKitchenAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  const orders = await prisma.order.findMany({
    where: {
      status: "paid",
      comandaSent: true,
      servedAt: null,
    },
    include: {
      items: true,
      session: { include: { table: true } },
    },
    orderBy: [{ paidAt: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ orders });
}

export async function PATCH(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = await req.json();
  const orderId = String(body.orderId || "");
  const action = String(body.action || "");

  if (!orderId || action !== "served") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }
  if (existing.status !== "paid") {
    return NextResponse.json(
      { error: "Solo se pueden marcar servidas las órdenes pagadas." },
      { status: 400 }
    );
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { servedAt: existing.servedAt ?? new Date() },
    include: {
      items: true,
      session: { include: { table: true } },
    },
  });

  return NextResponse.json({ ok: true, order });
}
