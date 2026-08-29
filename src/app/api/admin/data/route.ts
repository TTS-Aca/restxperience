import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

async function guard() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  const [settings, categories, products, tables, orders, reviews] =
    await Promise.all([
      prisma.settings.findUnique({ where: { id: "default" } }),
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.product.findMany({
        include: { category: true, ratings: true },
        orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      }),
      prisma.table.findMany({ orderBy: { number: "asc" } }),
      prisma.order.findMany({
        include: {
          items: true,
          session: { include: { table: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 40,
      }),
      prisma.review.findMany({
        include: { session: { include: { table: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

  return NextResponse.json({
    settings,
    categories,
    products,
    tables,
    orders,
    reviews,
  });
}

export async function PATCH(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = await req.json();
  const type = String(body.type || "");

  if (type === "settings") {
    const settings = await prisma.settings.update({
      where: { id: "default" },
      data: {
        restaurantName: body.restaurantName,
        tagline: body.tagline,
        welcomeMessage: body.welcomeMessage,
        commerceMode: ["menu_only", "stripe", "softrestaurant"].includes(
          String(body.commerceMode)
        )
          ? String(body.commerceMode)
          : "stripe",
        softRestaurantEndpoint: body.softRestaurantEndpoint || null,
        dishOfDayId: body.dishOfDayId || null,
      },
    });
    return NextResponse.json({ settings });
  }

  if (type === "product") {
    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 });
    }
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        price: Number(body.price),
        description: body.description ?? undefined,
        ingredients: body.ingredients ?? undefined,
        calories:
          body.calories === "" || body.calories == null
            ? null
            : Number(body.calories),
        imageUrl: body.imageUrl || null,
        videoUrl: body.videoUrl || null,
        available: body.available !== undefined ? Boolean(body.available) : undefined,
      },
    });
    return NextResponse.json({ product });
  }

  if (type === "product-create") {
    const categoryId = String(body.categoryId || "");
    const name = String(body.name || "").trim();
    const price = Number(body.price);
    if (!categoryId || !name || Number.isNaN(price)) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        name,
        slug: `${slugify(name)}-${Date.now()}`,
        price,
        description: body.description || "",
        ingredients: body.ingredients || "",
        calories:
          body.calories === "" || body.calories == null
            ? null
            : Number(body.calories),
        categoryId,
        imageUrl: body.imageUrl || null,
        videoUrl: body.videoUrl || null,
      },
    });
    return NextResponse.json({ product });
  }

  if (type === "product-delete") {
    await prisma.product.delete({ where: { id: String(body.id) } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Tipo desconocido" }, { status: 400 });
}
