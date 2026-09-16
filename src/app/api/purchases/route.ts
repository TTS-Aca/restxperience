import { NextResponse } from "next/server";
import {
  getRateableProductIds,
  getRateableProducts,
  hasPendingServedOrders,
  normalizeEmail,
} from "@/lib/purchases";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = normalizeEmail(String(searchParams.get("email") || ""));

  if (!email.includes("@")) {
    return NextResponse.json({
      productIds: [],
      rateableProducts: [],
      pendingInKitchen: false,
    });
  }

  const [productIds, rateableProducts, pendingInKitchen] = await Promise.all([
    getRateableProductIds(email),
    getRateableProducts(email),
    hasPendingServedOrders(email),
  ]);

  return NextResponse.json({
    productIds,
    rateableProducts,
    pendingInKitchen,
  });
}
