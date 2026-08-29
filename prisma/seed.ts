import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { CATEGORY_ORDER, MENU_SEED } from "./menu-data";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  await prisma.review.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.session.deleteMany();
  await prisma.table.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.settings.deleteMany();

  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "restx-admin",
    10
  );

  await prisma.settings.create({
    data: {
      id: "default",
      restaurantName: "RestXperience",
      tagline: "Menú digital con alma de parrilla",
      welcomeMessage:
        "Qué gusto tenerte en la mesa. Explora el menú, pide con calma y déjanos cuidarte esta noche.",
      paymentEnabled: false,
      softRestaurantEnabled: false,
      adminPasswordHash: passwordHash,
      currency: "MXN",
    },
  });

  const categoryMap = new Map<string, string>();
  for (let i = 0; i < CATEGORY_ORDER.length; i++) {
    const name = CATEGORY_ORDER[i];
    const cat = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        sortOrder: i,
      },
    });
    categoryMap.set(name, cat.id);
  }

  let dishOfDayId: string | null = null;
  for (let i = 0; i < MENU_SEED.length; i++) {
    const item = MENU_SEED[i];
    const categoryId = categoryMap.get(item.category);
    if (!categoryId) continue;

    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: `${slugify(item.name)}-${i}`,
        price: item.price,
        description: item.description || "",
        ingredients: item.ingredients || "",
        calories: item.calories ?? null,
        categoryId,
        sortOrder: i,
        available: true,
      },
    });

    if (item.name === "Rib Eye (350 gr)") {
      dishOfDayId = product.id;
    }
  }

  if (dishOfDayId) {
    await prisma.settings.update({
      where: { id: "default" },
      data: { dishOfDayId },
    });
  }

  for (let n = 1; n <= 12; n++) {
    await prisma.table.create({
      data: {
        number: n,
        label: `Mesa ${n}`,
        token: nanoid(10),
        active: true,
      },
    });
  }

  console.log("Seed complete.");
  console.log("Admin password:", process.env.ADMIN_PASSWORD || "restx-admin");
  console.log("Admin panel: /rx-admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
