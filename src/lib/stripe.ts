/**
 * Stripe adapter — pago primero, comanda después.
 * Sin STRIPE_SECRET_KEY opera en modo demo (confirma localmente).
 */

import type Stripe from "stripe";

export type StripeLineItem = {
  name: string;
  quantity: number;
  unitPrice: number; // MXN major units
};

export type CreateCheckoutResult =
  | {
      mode: "stripe";
      checkoutUrl: string;
      stripeSessionId: string;
    }
  | {
      mode: "demo";
      confirmUrl: string;
      demoToken: string;
    };

const API_VERSION = "2025-02-24.acacia" as const;

function toCents(amount: number) {
  return Math.round(amount * 100);
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function webhookConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
  );
}

export async function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY no configurada");
  }
  const Stripe = (await import("stripe")).default;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: API_VERSION,
  });
}

export async function createStripeCheckout(opts: {
  orderId: string;
  currency: string;
  lines: StripeLineItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string | null;
  metadata?: Record<string, string>;
}): Promise<CreateCheckoutResult> {
  if (!stripeConfigured()) {
    const demoToken = Buffer.from(
      JSON.stringify({ orderId: opts.orderId, t: Date.now() })
    ).toString("base64url");
    const confirmUrl = `${opts.successUrl}${
      opts.successUrl.includes("?") ? "&" : "?"
    }demo=${demoToken}&orderId=${opts.orderId}`;
    return { mode: "demo", confirmUrl, demoToken };
  }

  const stripe = await getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "es",
    payment_method_types: ["card"],
    success_url: `${opts.successUrl}${
      opts.successUrl.includes("?") ? "&" : "?"
    }session_id={CHECKOUT_SESSION_ID}&orderId=${opts.orderId}`,
    cancel_url: opts.cancelUrl,
    customer_email: opts.customerEmail || undefined,
    line_items: opts.lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: (opts.currency || "mxn").toLowerCase(),
        unit_amount: toCents(l.unitPrice),
        product_data: { name: l.name },
      },
    })),
    metadata: {
      orderId: opts.orderId,
      ...opts.metadata,
    },
  });

  if (!session.url) {
    throw new Error("Stripe no devolvió URL de checkout");
  }

  return {
    mode: "stripe",
    checkoutUrl: session.url,
    stripeSessionId: session.id,
  };
}

export async function verifyStripeSession(stripeSessionId: string) {
  if (!stripeConfigured()) {
    return { paid: false as const, reason: "Stripe no configurado" };
  }
  const stripe = await getStripe();
  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  return {
    paid: session.payment_status === "paid",
    orderId: session.metadata?.orderId,
    session,
  };
}

export async function constructStripeWebhookEvent(
  rawBody: string,
  signature: string
): Promise<Stripe.Event> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET no configurada");
  }
  const stripe = await getStripe();
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

export function checkoutSessionOrderId(
  session: Stripe.Checkout.Session
): string | null {
  return session.metadata?.orderId || null;
}
