import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const getPushKey = createServerFn({ method: "GET" }).handler(async () => {
  const { publicVapidKey } = await import("./push.server");
  return { key: await publicVapidKey() };
});

export const savePushSub = createServerFn({ method: "POST" })
  .validator((d: { endpoint: string; p256dh: string; auth: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { saveSub } = await import("./push.server");
    await saveSub(context.userId, data);
    return { ok: true as const };
  });

export const dropPushSub = createServerFn({ method: "POST" })
  .validator((d: { endpoint: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { dropSub } = await import("./push.server");
    await dropSub(context.userId, String(data.endpoint ?? ""));
    return { ok: true as const };
  });

export const pingSelf = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { notifyUser } = await import("./push.server");
    await notifyUser(context.userId, {
      title: "Soulrift Crusher",
      body: "Hunt alerts are live. Raids, trades, and arena hits will ping you.",
      url: "/",
    });
    return { ok: true as const };
  });
