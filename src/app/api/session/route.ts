import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request) {
  const body = await req.json();
  const sessionId = String(body.sessionId || "");
  const email = String(body.email || "")
    .trim()
    .toLowerCase();

  if (!sessionId || !email.includes("@")) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const session = await prisma.session.update({
    where: { id: sessionId },
    data: { email },
  });

  return NextResponse.json({ ok: true, email: session.email });
}
