import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
        const header = request.headers.get("stripe-signature") ?? "";
        if (!secret || !header) return new Response("missing signature", { status: 400 });
        const { stripeSigned, fulfillStripeEvent } = await import("@/game/stripe.server");
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
