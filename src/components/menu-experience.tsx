"use client";

import { useMemo, useState } from "react";
import { CartDrawer } from "./cart-drawer";
import { CartProvider } from "./cart-provider";
import { ChatBot } from "./chat-bot";
import { ProductCard, type MenuProduct } from "./product-card";
import { ReviewPanel } from "./review-panel";
import { SessionEmail } from "./session-email";

type CategoryBlock = {
  id: string;
  name: string;
  products: MenuProduct[];
};

export function MenuExperience({
  tableLabel,
  tableToken,
  sessionId,
  initialEmail,
  restaurantName,
  tagline,
  welcomeMessage,
  currency,
  paymentEnabled,
  dishOfDayName,
  categories,
  canReview,
}: {
  tableLabel: string;
  tableToken: string;
  sessionId: string;
  initialEmail: string | null;
  restaurantName: string;
  tagline: string;
  welcomeMessage: string;
  currency: string;
  paymentEnabled: boolean;
  dishOfDayName: string | null;
  categories: CategoryBlock[];
  canReview: boolean;
}) {
  const [active, setActive] = useState(categories[0]?.id || "");
  const [email, setEmail] = useState(initialEmail);
  const flat = useMemo(
    () => categories.flatMap((c) => c.products),
    [categories]
  );

  return (
    <CartProvider storageKey={`rx-cart-${tableToken}`}>
      <div className="relative min-h-dvh pb-28">
        <div className="atmosphere" aria-hidden />

        <header className="relative px-5 pt-10 pb-6">
          <p className="mb-2 text-xs tracking-[0.35em] text-[#c4a574]/80 uppercase">
            {tableLabel}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-none text-white sm:text-5xl">
            {restaurantName}
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/55">{tagline}</p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70">
            {welcomeMessage}
          </p>
          {dishOfDayName && (
            <div className="glass-pill mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm text-[#e8d5b5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c4a574]" />
              Comida del día: {dishOfDayName}
            </div>
          )}
        </header>

        <div className="relative px-5">
          <SessionEmail
            sessionId={sessionId}
            email={email}
            onSaved={setEmail}
          />
        </div>

        <nav className="sticky top-0 z-20 mt-4 overflow-x-auto border-y border-white/5 bg-[#1a1614]/70 px-5 py-3 backdrop-blur-xl">
          <div className="flex min-w-max gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActive(cat.id);
                  document
                    .getElementById(`cat-${cat.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`rounded-full px-4 py-2 text-sm whitespace-nowrap transition ${
                  active === cat.id
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </nav>

        <main className="relative space-y-10 px-5 pt-6">
          {categories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-24">
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl text-white/90">
                {cat.name}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currency={currency}
                    guestEmail={email}
                  />
                ))}
              </div>
            </section>
          ))}

          {canReview && (
            <ReviewPanel sessionId={sessionId} email={email} />
          )}

          {!flat.length && (
            <p className="py-20 text-center text-white/40">
              El menú se está preparando…
            </p>
          )}
        </main>

        <CartDrawer
          currency={currency}
          paymentEnabled={paymentEnabled}
          tableToken={tableToken}
          sessionId={sessionId}
          guestEmail={email}
        />
        <ChatBot
          restaurantName={restaurantName}
          welcomeMessage={welcomeMessage}
          dishOfDayName={dishOfDayName}
        />
      </div>
    </CartProvider>
  );
}
