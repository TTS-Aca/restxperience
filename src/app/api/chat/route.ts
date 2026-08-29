import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildBotReply } from "@/lib/chatbot";

export async function POST(req: Request) {
  const body = await req.json();
  const message = String(body.message || "").slice(0, 500);
  if (!message) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const dish = settings?.dishOfDayId
    ? await prisma.product.findUnique({
        where: { id: settings.dishOfDayId },
        include: { category: true },
      })
    : null;

  const sample = await prisma.product.findMany({
    where: { available: true },
    include: { category: true },
    take: 80,
    orderBy: { sortOrder: "asc" },
  });

  const reply = buildBotReply(
    message,
    dish
      ? {
          name: dish.name,
          price: dish.price,
          category: dish.category.name,
          description: dish.description,
        }
      : null,
    sample.map((p) => ({
      name: p.name,
      price: p.price,
      category: p.category.name,
      description: p.description,
    })),
    settings?.restaurantName || "RestXperience"
  );

  return NextResponse.json({ reply });
}
