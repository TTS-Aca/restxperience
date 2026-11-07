import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const ADMIN_COOKIE = "rx_admin";
const DEFAULT_ADMIN_PASSWORD = "restx-admin";

/**
 * Sin secreto configurado, la sesión usa uno aleatorio por proceso: un valor
 * fijo en el código permitiría falsificar la cookie. Va en globalThis porque
 * cada ruta de Next empaqueta su propia copia de este módulo.
 */
const fallbackSecrets = globalThis as typeof globalThis & {
  __rxAdminSecret?: string;
  __rxKitchenSecret?: string;
};
fallbackSecrets.__rxAdminSecret ??= randomBytes(32).toString("hex");
fallbackSecrets.__rxKitchenSecret ??= randomBytes(32).toString("hex");

function adminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || fallbackSecrets.__rxAdminSecret!;
}

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
  jar.set(ADMIN_COOKIE, adminSessionSecret(), {
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
  return value === adminSessionSecret();
}

const KITCHEN_COOKIE = "rx_kitchen";
const DEFAULT_KITCHEN_PASSWORD = "restx-kitchen";

function envKitchenPassword() {
  const value = process.env.KITCHEN_PASSWORD?.trim();
  return value || DEFAULT_KITCHEN_PASSWORD;
}

function kitchenSessionSecret() {
  return process.env.KITCHEN_SESSION_SECRET || fallbackSecrets.__rxKitchenSecret!;
}

export function verifyKitchenPassword(password: string) {
  const typed = password.trim();
  if (!typed) return false;
  return typed === envKitchenPassword();
}

export async function setKitchenSession() {
  const jar = await cookies();
  jar.set(KITCHEN_COOKIE, kitchenSessionSecret(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearKitchenSession() {
  const jar = await cookies();
  jar.delete(KITCHEN_COOKIE);
}

export async function isKitchenAuthenticated() {
  const jar = await cookies();
  const value = jar.get(KITCHEN_COOKIE)?.value;
  return value === kitchenSessionSecret();
}
