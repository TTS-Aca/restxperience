import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const productId = String(body.productId || "");
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const stars = Number(body.stars);

  if (!productId || !email.includes("@") || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const rating = await prisma.rating.upsert({
    where: { productId_email: { productId, email } },
    create: { productId, email, stars },
    update: { stars },
  });

  return NextResponse.json({ ok: true, rating });
}
