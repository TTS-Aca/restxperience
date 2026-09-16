import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/analytics";
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

  const [settings, categories, products, tables, orders, reviews, analytics] =
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
        take: 100,
      }),
      prisma.review.findMany({
        include: { session: { include: { table: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      getAdminAnalytics(),
    ]);

  return NextResponse.json({
    settings,
    categories,
    products,
    tables,
    orders,
    reviews,
    analytics,
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
    const categoryId = body.categoryId ? String(body.categoryId) : undefined;
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
        available:
          body.available !== undefined ? Boolean(body.available) : undefined,
        ...(categoryId ? { categoryId } : {}),
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
        available:
          body.available !== undefined ? Boolean(body.available) : true,
      },
    });
    return NextResponse.json({ product });
  }

  if (type === "product-delete") {
    await prisma.product.delete({ where: { id: String(body.id) } });
    return NextResponse.json({ ok: true });
  }

  if (type === "category-create") {
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }
    const last = await prisma.category.findFirst({
      orderBy: { sortOrder: "desc" },
    });
    const category = await prisma.category.create({
      data: {
        name,
        slug: `${slugify(name) || "categoria"}-${Date.now()}`,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
    return NextResponse.json({ category });
  }

  if (type === "table-create") {
    const last = await prisma.table.findFirst({ orderBy: { number: "desc" } });
    const number = body.number ? Number(body.number) : (last?.number ?? 0) + 1;
    if (!Number.isInteger(number) || number < 1) {
      return NextResponse.json({ error: "Número de mesa inválido" }, { status: 400 });
    }
    const exists = await prisma.table.findUnique({ where: { number } });
    if (exists) {
      return NextResponse.json(
        { error: `Ya existe la mesa ${number}` },
        { status: 400 }
      );
    }
    const table = await prisma.table.create({
      data: {
        number,
        label: String(body.label || "").trim() || `Mesa ${number}`,
        token: nanoid(10),
        active: true,
      },
    });
    return NextResponse.json({ table });
  }

  if (type === "table-delete") {
    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 });
    }
    try {
      await prisma.table.delete({ where: { id } });
    } catch {
      return NextResponse.json(
        { error: "No se puede eliminar: la mesa ya tiene sesiones." },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (type === "menu-csv-import") {
    const { parseMenuCsv } = await import("@/lib/menu-csv");
    const csv = String(body.csv || "");
    const { rows, errors } = parseMenuCsv(csv);
    if (!rows.length) {
      return NextResponse.json(
        { error: errors[0] || "No hay filas válidas", errors },
        { status: 400 }
      );
    }

    const existingCategories = await prisma.category.findMany();
    const categoryByName = new Map(
      existingCategories.map((c) => [c.name.trim().toLowerCase(), c])
    );
    let lastSort = existingCategories.reduce(
      (max, c) => Math.max(max, c.sortOrder),
      -1
    );

    let created = 0;
    let updated = 0;

    for (const row of rows) {
      const key = row.category.trim().toLowerCase();
      let category = categoryByName.get(key);
      if (!category) {
        lastSort += 1;
        category = await prisma.category.create({
          data: {
            name: row.category.trim(),
            slug: `${slugify(row.category) || "categoria"}-${Date.now()}`,
            sortOrder: lastSort,
          },
        });
        categoryByName.set(key, category);
      }

      const existing = await prisma.product.findFirst({
        where: {
          categoryId: category.id,
          name: { equals: row.name, mode: "insensitive" },
        },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            price: row.price,
            description: row.description,
            ingredients: row.ingredients,
            calories: row.calories,
          },
        });
        updated += 1;
      } else {
        await prisma.product.create({
          data: {
            name: row.name,
            slug: `${slugify(row.name) || "producto"}-${Date.now()}-${created}`,
            price: row.price,
            description: row.description,
            ingredients: row.ingredients,
            calories: row.calories,
            categoryId: category.id,
            available: true,
          },
        });
        created += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      created,
      updated,
      skipped: errors.length,
      errors,
    });
  }

  return NextResponse.json({ error: "Tipo desconocido" }, { status: 400 });
}
