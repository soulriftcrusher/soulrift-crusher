import { createRequire } from "node:module";
import type { Sql } from "@/lib/db";

export type HuntPing = {
  title: string;
  body: string;
  url?: string;
};

type WebPush = {
  generateVAPIDKeys: () => { publicKey: string; privateKey: string };
  setVapidDetails: (subject: string, publicKey: string, privateKey: string) => void;
  sendNotification: (
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string,
  ) => Promise<unknown>;
};

function webPush(): WebPush {
  const require = createRequire(import.meta.url);
  return require("web-push") as WebPush;
}

async function vapid(sql: Sql): Promise<{ public_key: string; private_key: string }> {
  const rows = await sql<{ public_key: string; private_key: string }>`
    select public_key, private_key from push_meta where id = 1
  `;
  if (rows[0]) return rows[0];
  const keys = webPush().generateVAPIDKeys();
  await sql`
    insert into push_meta (id, public_key, private_key)
    values (1, ${keys.publicKey}, ${keys.privateKey})
    on conflict (id) do nothing
  `;
  const again = await sql<{ public_key: string; private_key: string }>`
    select public_key, private_key from push_meta where id = 1
  `;
  return again[0] ?? { public_key: keys.publicKey, private_key: keys.privateKey };
}

export async function publicVapidKey(): Promise<string> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const keys = await vapid(sql);
  return keys.public_key;
}

export async function notifyUser(userId: string, ping: HuntPing): Promise<void> {
  if (!userId) return;
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const keys = await vapid(sql);
  const subs = await sql<{ endpoint: string; p256dh: string; auth: string }>`
    select endpoint, p256dh, auth from push_subscriptions where user_id = ${userId}
  `;
  if (subs.length === 0) return;
  const wp = webPush();
  wp.setVapidDetails("mailto:alerts@soulrift.game", keys.public_key, keys.private_key);
  const payload = JSON.stringify({
    title: ping.title.slice(0, 64),
    body: ping.body.slice(0, 140),
    url: ping.url ?? "/?tab=clan",
  });
  await Promise.all(
    subs.map(async (s) => {
      try {
        await wp.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
      } catch (err) {
        const status = Number((err as { statusCode?: number } | null)?.statusCode ?? 0);
        if (status === 404 || status === 410) {
          await sql`delete from push_subscriptions where endpoint = ${s.endpoint}`;
        }
      }
    }),
  );
}

export async function saveSub(
  userId: string,
  data: { endpoint: string; p256dh: string; auth: string },
): Promise<void> {
  const endpoint = String(data.endpoint ?? "").slice(0, 2000);
  const p256dh = String(data.p256dh ?? "").slice(0, 200);
  const auth = String(data.auth ?? "").slice(0, 200);
  if (!endpoint.startsWith("https://") || !p256dh || !auth) throw new Error("Bad subscription.");
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await sql`
    insert into push_subscriptions (endpoint, user_id, p256dh, auth)
    values (${endpoint}, ${userId}, ${p256dh}, ${auth})
    on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth
  `;
}

export async function dropSub(userId: string, endpoint: string): Promise<void> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await sql`delete from push_subscriptions where user_id = ${userId} and endpoint = ${endpoint}`;
}
