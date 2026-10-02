import { createFileRoute } from "@tanstack/react-router";
import { BAKED_STRIPE_WEBHOOK_SECRET } from "@/game/baked-stripe";
import { runtimeValue, stripeSigned, fulfillStripeEvent } from "@/game/stripe.server";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const secret = BAKED_STRIPE_WEBHOOK_SECRET || runtimeValue("STRIPE_WEBHOOK_SECRET");
        const header = request.headers.get("stripe-signature") ?? "";
        if (!secret || !header) return new Response("missing signature", { status: 400 });
        if (!stripeSigned(raw, header, secret)) return new Response("bad signature", { status: 400 });
        try {
          await fulfillStripeEvent(raw);
        } catch {
          return new Response("fulfill failed", { status: 500 });
        }
        return Response.json({ received: true });
      },
    },
  },
});
