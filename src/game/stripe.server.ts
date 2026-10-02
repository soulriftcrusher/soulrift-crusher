import { createHmac, timingSafeEqual } from "node:crypto";
import { liveEnv } from "@/lib/auth/live-env";
import { GEM_PACKS } from "./meta";

const CENTS: Record<string, number> = {
  firstblood: 99,
  purse: 99,
  coffer: 499,
  vault: 999,
  hoard: 1999,
  "god-auric": 1999,
  "god-solenne": 2999,
  "god-vael": 4999,
};

const GODS: Record<string, string> = {
  "god-auric": "auric",
  "god-solenne": "solenne",
  "god-vael": "vael",
};

export function packCents(id: string): number {
  return CENTS[id] ?? 0;
}

export async function startStripeCheckout(userId: string, packId: string): Promise<string> {
  const key = liveEnv("STRIPE_SECRET_KEY");
  if (!key.startsWith("sk_") && !key.startsWith("rk_")) throw new Error("Stripe is not switched on yet.");
  const pack = GEM_PACKS.find((p) => p.id === packId);
  const cents = packCents(packId);
  if (!pack || cents < 50) throw new Error("Unknown pack.");
  const site = "https://www.soulriftcrusher.com";
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("managed_payments[enabled]", "false");
  body.set("success_url", `${site}/?paid=1`);
  body.set("cancel_url", `${site}/?paid=0`);
  body.set("client_reference_id", userId);
  body.set("metadata[userId]", userId);
  body.set("metadata[packId]", pack.id);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", String(cents));
  body.set("line_items[0][price_data][product_data][name]", pack.name);
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !json.url) throw new Error(json.error?.message || "Stripe did not open the card page.");
  return json.url;
}

function signatures(header: string): { t: string; v1: string[] } {
  const t = header.split(",").find((p) => p.startsWith("t="))?.slice(2) ?? "";
  const v1 = header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));
  return { t, v1 };
}

export function stripeSigned(raw: string, header: string, secret: string): boolean {
  const { t, v1 } = signatures(header);
  if (!t || v1.length === 0) return false;
  const age = Math.abs(Date.now() / 1000 - Number(t));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex");
  const a = Buffer.from(expected);
  return v1.some((sig) => {
    const b = Buffer.from(sig);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

type StripeEvent = {
  type?: string;
  data?: { object?: { id?: string; payment_status?: string; metadata?: { userId?: string; packId?: string } } };
};

export async function fulfillStripeEvent(raw: string): Promise<void> {
  const event = JSON.parse(raw) as StripeEvent;
  if (event.type !== "checkout.session.completed") return;
  const session = event.data?.object;
  if (!session?.id || session.payment_status !== "paid") return;
  const userId = String(session.metadata?.userId ?? "");
  const packId = String(session.metadata?.packId ?? "");
  const pack = GEM_PACKS.find((p) => p.id === packId);
  if (!userId || !pack) return;
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const inserted = await sql<{ session_id: string }>`
    insert into stripe_payments (session_id, user_id, pack_id)
    values (${session.id}, ${userId}, ${pack.id})
    on conflict (session_id) do nothing
    returning session_id
  `;
  if (!inserted[0]) return;
  const god = GODS[pack.id];
  if (god) {
    await sql`
      insert into paid_gods (user_id, hero_id)
      values (${userId}, ${god})
      on conflict (user_id, hero_id) do nothing
    `;
    return;
  }
  if (pack.id === "firstblood") {
    await sql`
      insert into paid_perks (user_id, first_blood)
      values (${userId}, true)
      on conflict (user_id) do update set first_blood = true
    `;
    await sql`
      insert into gem_grants (user_id, gems)
      values (${userId}, ${pack.gems})
      on conflict (user_id) do update set gems = gem_grants.gems + excluded.gems
    `;
    return;
  }
  if (pack.gems > 0) {
    await sql`
      insert into gem_grants (user_id, gems)
      values (${userId}, ${pack.gems})
      on conflict (user_id) do update set gems = gem_grants.gems + excluded.gems
    `;
  }
}
