import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, tables] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "default" } }),
    prisma.table.findMany({
      where: { active: true },
      orderBy: { number: "asc" },
      take: 12,
    }),
  ]);

  const name = settings?.restaurantName || "RestXperience";

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="atmosphere" />
      <main className="relative mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-xs tracking-[0.4em] text-[#c4a574]/80 uppercase">
          Menú digital
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-white sm:text-6xl">
          {name}
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
          {settings?.tagline ||
            "Escanea el QR de tu mesa para abrir tu sesión, explorar el menú y pedir con calma."}
        </p>

        <div className="mt-10 space-y-3">
          <p className="text-xs tracking-wide text-white/40 uppercase">
            Entrar a una mesa (demo)
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {tables.map((t) => (
              <Link
                key={t.id}
                href={`/mesa/${t.token}`}
                className="glass-card px-3 py-4 text-center text-sm text-white/80 transition hover:bg-white/10"
              >
                Mesa {t.number}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-12 text-xs text-white/30">
          Panel de gestión en ruta secreta del restaurante.
        </p>
      </main>
    </div>
  );
}
