import { notFound } from "next/navigation";
import { MenuExperience } from "@/components/menu-experience";
import { prisma } from "@/lib/db";
import { avgRating } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MesaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const table = await prisma.table.findUnique({ where: { token } });
  if (!table || !table.active) notFound();

  let session = await prisma.session.findFirst({
    where: { tableId: table.id, status: { in: ["open", "paid"] } },
    orderBy: { createdAt: "desc" },
    include: { orders: true },
  });

  if (!session) {
    session = await prisma.session.create({
      data: { tableId: table.id },
      include: { orders: true },
    });
  }

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { available: true },
        orderBy: { sortOrder: "asc" },
        include: { ratings: true },
      },
    },
  });

  const dishOfDay = settings?.dishOfDayId
    ? await prisma.product.findUnique({ where: { id: settings.dishOfDayId } })
    : null;

  const canReview =
    session.status === "paid" ||
    session.orders.some((o) => o.status === "paid");

  return (
    <MenuExperience
      tableLabel={table.label}
      tableToken={table.token}
      sessionId={session.id}
      initialEmail={session.email}
      restaurantName={settings?.restaurantName || "RestXperience"}
      tagline={settings?.tagline || ""}
      welcomeMessage={settings?.welcomeMessage || ""}
      currency={settings?.currency || "MXN"}
      paymentEnabled={Boolean(settings?.paymentEnabled)}
      dishOfDayName={dishOfDay?.name || null}
      canReview={canReview}
      categories={categories
        .filter((c) => c.products.length)
        .map((c) => ({
          id: c.id,
          name: c.name,
          products: c.products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            description: p.description,
            ingredients: p.ingredients,
            calories: p.calories,
            imageUrl: p.imageUrl,
            videoUrl: p.videoUrl,
            avgStars: avgRating(p.ratings),
            ratingCount: p.ratings.length,
          })),
        }))}
    />
  );
}
