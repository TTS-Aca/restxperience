import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const ADMIN_COOKIE = "rx_admin";
const DEFAULT_ADMIN_PASSWORD = "restx-admin";

function envAdminPassword() {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value || DEFAULT_ADMIN_PASSWORD;
}

export async function verifyAdminPassword(password: string) {
  const typed = password.trim();
  if (!typed) return false;

  if (typed === envAdminPassword()) {
    await ensureAdminSettings(typed);
    return true;
  }

  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });
  if (!settings?.adminPasswordHash) return false;
  return bcrypt.compare(typed, settings.adminPasswordHash);
}

async function ensureAdminSettings(password: string) {
  const adminPasswordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.settings.findUnique({
    where: { id: "default" },
  });

  if (!existing) {
    await prisma.settings.create({
      data: {
        id: "default",
        restaurantName: "RestXperience",
        tagline: "Tu experiencia gastronómica digital",
        welcomeMessage: "Bienvenido. Estamos felices de recibirte.",
        commerceMode: "stripe",
        adminPasswordHash,
        currency: "MXN",
      },
    });
    return;
  }

  await prisma.settings.update({
    where: { id: "default" },
    data: { adminPasswordHash },
  });
}

export async function setAdminSession() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, process.env.ADMIN_SESSION_SECRET || "rx-session-ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
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
