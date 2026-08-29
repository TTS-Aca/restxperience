import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const sessionId = String(body.sessionId || "");
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const stars = Number(body.stars);
  const comment = String(body.comment || "").trim();

  if (!sessionId || !email.includes("@") || stars < 1 || stars > 5 || !comment) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { orders: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  const hasPaid = session.orders.some((o) => o.status === "paid");
  if (!hasPaid && session.status !== "paid") {
    return NextResponse.json(
      { error: "La reseña se habilita cuando la cuenta esté pagada." },
      { status: 403 }
    );
  }

  const review = await prisma.review.create({
    data: { sessionId, email, stars, comment },
  });

  return NextResponse.json({ ok: true, review });
}
