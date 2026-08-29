import { prisma } from "./db";
import {
  isSessionExpired,
  sessionExpiryDate,
  SESSION_TTL_MS,
} from "./commerce";

/**
 * Obtiene sesión abierta vigente o crea una nueva.
 * Si la anterior expiró (15 min sin concretar) se cierra.
 */
export async function getOrCreateTableSession(tableId: string) {
  const existing = await prisma.session.findFirst({
    where: { tableId, status: { in: ["open", "paid"] } },
    orderBy: { createdAt: "desc" },
    include: { orders: true },
  });

  if (existing) {
    const hasPaidOrder = existing.orders.some((o) => o.status === "paid");

    // Sesión pagada sigue viva para reseña, pero no se "renueva" el TTL de pedido
    if (existing.status === "paid" || hasPaidOrder) {
      return existing;
    }

    if (isSessionExpired(existing)) {
      await prisma.session.update({
        where: { id: existing.id },
        data: { status: "closed" },
      });
    } else {
      // Renovar actividad / ventana de 15 min mientras explora
      return prisma.session.update({
        where: { id: existing.id },
        data: {
          lastActivityAt: new Date(),
          expiresAt: sessionExpiryDate(),
        },
        include: { orders: true },
      });
    }
  }

  const now = new Date();
  return prisma.session.create({
    data: {
      tableId,
      status: "open",
      lastActivityAt: now,
      expiresAt: sessionExpiryDate(now),
    },
    include: { orders: true },
  });
}

export async function touchSession(sessionId: string) {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session || session.status !== "open") return session;

  if (isSessionExpired(session)) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { status: "closed" },
    });
  }

  return prisma.session.update({
    where: { id: sessionId },
    data: {
      lastActivityAt: new Date(),
      expiresAt: sessionExpiryDate(),
    },
  });
}

export async function assertSessionOpen(sessionId: string, tableToken: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { table: true, orders: true },
  });

  if (!session || session.table.token !== tableToken) {
    return { ok: false as const, error: "Sesión inválida", status: 400 };
  }

  if (session.status === "closed" || isSessionExpired(session)) {
    if (session.status !== "closed") {
      await prisma.session.update({
        where: { id: session.id },
        data: { status: "closed" },
      });
    }
    return {
      ok: false as const,
      error:
        "Tu sesión expiró (15 min sin concretar). Escanea de nuevo el QR de la mesa.",
      status: 410,
    };
  }

  return { ok: true as const, session };
}

export { SESSION_TTL_MS };
