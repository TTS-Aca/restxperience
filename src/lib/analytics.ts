import { prisma } from "./db";

type PeriodStats = {
  revenue: number;
  orderCount: number;
  avgTicket: number;
};

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const d = startOfDay();
  d.setDate(d.getDate() - n);
  return d;
}

function statsFromOrders(
  orders: { total: number }[]
): Omit<PeriodStats, "avgTicket"> & { avgTicket: number } {
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const orderCount = orders.length;
  const avgTicket = orderCount ? revenue / orderCount : 0;
  return { revenue, orderCount, avgTicket };
}

export async function getAdminAnalytics() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = daysAgo(7);
  const monthStart = daysAgo(30);

  const paidOrders = await prisma.order.findMany({
    where: { status: "paid" },
    include: {
      items: true,
      session: { include: { table: true } },
    },
    orderBy: { paidAt: "desc" },
  });

  const withPaidAt = paidOrders.map((o) => ({
    ...o,
    effectivePaidAt: o.paidAt ?? o.createdAt,
  }));

  const todayOrders = withPaidAt.filter((o) => o.effectivePaidAt >= todayStart);
  const weekOrders = withPaidAt.filter((o) => o.effectivePaidAt >= weekStart);
  const monthOrders = withPaidAt.filter((o) => o.effectivePaidAt >= monthStart);

  const productMap = new Map<
    string,
    { name: string; quantity: number; revenue: number }
  >();

  for (const order of monthOrders) {
    for (const item of order.items) {
      const key = item.name;
      const prev = productMap.get(key) ?? {
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      prev.quantity += item.quantity;
      prev.revenue += item.unitPrice * item.quantity;
      productMap.set(key, prev);
    }
  }

  const topProducts = [...productMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  return {
    today: statsFromOrders(todayOrders),
    week: statsFromOrders(weekOrders),
    month: statsFromOrders(monthOrders),
    topProducts,
    recentOrders: paidOrders.slice(0, 12).map((o) => ({
      id: o.id,
      total: o.total,
      tableLabel: o.session.table.label,
      paidAt: o.paidAt,
      servedAt: o.servedAt,
      itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
    })),
  };
}
