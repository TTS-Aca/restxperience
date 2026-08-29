import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const ADMIN_COOKIE = "rx_admin";

export async function verifyAdminPassword(password: string) {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!settings) return false;
  return bcrypt.compare(password, settings.adminPasswordHash);
}

export async function setAdminSession() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, process.env.ADMIN_SESSION_SECRET || "rx-session-ok", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  const value = jar.get(ADMIN_COOKIE)?.value;
  return value === (process.env.ADMIN_SESSION_SECRET || "rx-session-ok");
}
