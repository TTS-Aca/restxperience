import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  canRateProduct,
  normalizeEmail,
} from "@/lib/purchases";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = String(searchParams.get("productId") || "");
  const limit = Math.min(Number(searchParams.get("limit") || 3), 10);

  if (!productId) {
    return NextResponse.json({ error: "productId requerido" }, { status: 400 });
  }

  const ratings = await prisma.rating.findMany({
    where: {
      productId,
      comment: { not: "" },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      stars: true,
      comment: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ opinions: ratings });
}

export async function POST(req: Request) {
  const body = await req.json();
  const productId = String(body.productId || "");
  const sessionId = String(body.sessionId || "");
  const email = normalizeEmail(String(body.email || ""));
  const stars = Number(body.stars);
  const comment = String(body.comment || "").trim();

  if (
    !productId ||
    !sessionId ||
    !email.includes("@") ||
    stars < 1 ||
    stars > 5
  ) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (!comment) {
    return NextResponse.json(
      { error: "Escribe una opinión junto con tu calificación." },
      { status: 400 }
    );
  }

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 400 });
  }

  const sessionEmail = session.email
    ? normalizeEmail(session.email)
    : null;
  if (!sessionEmail || sessionEmail !== email) {
    return NextResponse.json(
      {
        error:
          "El correo debe coincidir con el guardado en tu sesión para calificar.",
      },
      { status: 403 }
    );
  }

  const rateable = await canRateProduct(email, productId);
  if (!rateable) {
    return NextResponse.json(
      {
        error:
          "Podrás calificar cuando tu pedido haya sido pagado y servido en mesa.",
      },
      { status: 403 }
    );
  }

  const rating = await prisma.rating.upsert({
    where: { productId_email: { productId, email } },
    create: { productId, email, stars, comment },
    update: { stars, comment },
  });

  return NextResponse.json({ ok: true, rating });
}
