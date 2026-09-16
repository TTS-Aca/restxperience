import { prisma } from "./db";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const paidServedOrderFilter = (email: string) => ({
  status: "paid" as const,
  servedAt: { not: null },
  OR: [
    { guestEmail: { equals: email, mode: "insensitive" as const } },
    { session: { email: { equals: email, mode: "insensitive" as const } } },
  ],
});

/** Product IDs from orders that are paid AND marked served. */
export async function getRateableProductIds(email: string): Promise<string[]> {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@")) return [];

  const items = await prisma.orderItem.findMany({
    where: {
      order: paidServedOrderFilter(normalized),
    },
    select: { productId: true },
    distinct: ["productId"],
  });

  return items.map((i) => i.productId);
}

export async function canRateProduct(
  email: string,
  productId: string
): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@") || !productId) return false;

  const item = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: paidServedOrderFilter(normalized),
    },
    select: { id: true },
  });

  return !!item;
}

export type RateableProduct = {
  productId: string;
  name: string;
  orderId: string;
};

/** Products the guest can rate right now (paid + served, with names). */
export async function getRateableProducts(
  email: string
): Promise<RateableProduct[]> {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@")) return [];

  const items = await prisma.orderItem.findMany({
    where: {
      order: paidServedOrderFilter(normalized),
    },
    select: {
      productId: true,
      name: true,
      orderId: true,
    },
    orderBy: { order: { servedAt: "desc" } },
  });

  const seen = new Set<string>();
  const result: RateableProduct[] = [];
  for (const item of items) {
    if (seen.has(item.productId)) continue;
    seen.add(item.productId);
    result.push({
      productId: item.productId,
      name: item.name,
      orderId: item.orderId,
    });
  }
  return result;
}

/** Paid but not yet served — for "en cocina" messaging. */
export async function hasPendingServedOrders(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@")) return false;

  const count = await prisma.order.count({
    where: {
      status: "paid",
      servedAt: null,
      OR: [
        { guestEmail: { equals: normalized, mode: "insensitive" } },
        { session: { email: { equals: normalized, mode: "insensitive" } } },
      ],
    },
  });

  return count > 0;
}

/** @deprecated Use getRateableProductIds */
export async function getPurchasedProductIds(email: string): Promise<string[]> {
  return getRateableProductIds(email);
}

/** @deprecated Use canRateProduct */
export async function hasPurchasedProduct(
  email: string,
  productId: string
): Promise<boolean> {
  return canRateProduct(email, productId);
}
