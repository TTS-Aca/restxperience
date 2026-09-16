import { prisma } from "../src/lib/db";

async function main() {
  const ratings = await prisma.rating.findMany({
    select: { id: true, productId: true, email: true },
  });

  let removed = 0;
  for (const rating of ratings) {
    const valid = await prisma.orderItem.findFirst({
      where: {
        productId: rating.productId,
        order: {
          status: "paid",
          servedAt: { not: null },
          OR: [
            { guestEmail: { equals: rating.email, mode: "insensitive" } },
            {
              session: {
                email: { equals: rating.email, mode: "insensitive" },
              },
            },
          ],
        },
      },
      select: { id: true },
    });

    if (!valid) {
      await prisma.rating.delete({ where: { id: rating.id } });
      removed += 1;
    }
  }

  const remaining = await prisma.rating.count();
  console.log(`Removed ${removed} invalid ratings. ${remaining} remaining.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
