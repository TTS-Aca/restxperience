import { NextResponse } from "next/server";
import {
  clearAdminSession,
  isAdminAuthenticated,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const password = String(body.password || "");
  const ok = await verifyAdminPassword(password);
  if (!ok) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  await setAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: await isAdminAuthenticated() });
}
