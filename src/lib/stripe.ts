/**
 * Stripe adapter — pago primero, comanda después.
 * Sin STRIPE_SECRET_KEY opera en modo demo (confirma localmente).
 */

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

function toCents(amount: number) {
  return Math.round(amount * 100);
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
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

  // Dynamic import to keep build working without stripe types if unused
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
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
    return { paid: false, reason: "Stripe no configurado" };
  }
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });
  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  return {
    paid: session.payment_status === "paid",
    orderId: session.metadata?.orderId,
    session,
  };
}
