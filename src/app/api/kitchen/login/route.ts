import { NextResponse } from "next/server";
import {
  clearKitchenSession,
  isKitchenAuthenticated,
  setKitchenSession,
  verifyKitchenPassword,
} from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const password = String(body.password || "");
  const ok = verifyKitchenPassword(password);
  if (!ok) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  await setKitchenSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearKitchenSession();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: await isKitchenAuthenticated() });
}
