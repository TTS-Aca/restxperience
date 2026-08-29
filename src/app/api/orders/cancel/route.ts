import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const orderId = String(body.orderId || "");
  if (!orderId) {
    return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  if (order.comandaSent || order.status === "paid") {
    return NextResponse.json(
      { error: "La orden ya fue pagada; no se puede cancelar." },
      { status: 400 }
    );
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "cancelled" },
  });

  return NextResponse.json({ ok: true });
}
