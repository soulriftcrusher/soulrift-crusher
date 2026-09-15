import { dropPushSub, getPushKey, pingSelf, savePushSub } from "./push-net";
import { queueBackgroundSync, registerBackgroundHunt } from "./bg-sync";

const FLAG = "soulrift-alerts";

function b64ToBytes(b64: string): BufferSource {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

export function alertsWanted(): boolean {
  try {
    return localStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

export function alertsPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

async function showLocal(body: string, url = "/") {
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification("Soulrift Crusher", {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url },
  });
}

export async function enableHuntAlerts(): Promise<"on" | "denied" | "unsupported"> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported";
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return "denied";
  localStorage.setItem(FLAG, "1");
  const reg = await navigator.serviceWorker.ready;
  void queueBackgroundSync({ alerts: true });
  await registerBackgroundHunt();
  try {
    const sync = (reg as ServiceWorkerRegistration & {
      periodicSync?: { register: (tag: string, opts: { minInterval: number }) => Promise<void> };
    }).periodicSync;
    await sync?.register("soulrift-sync", { minInterval: 15 * 60 * 1000 });
    await sync?.register("hunt-ping", { minInterval: 12 * 60 * 60 * 1000 });
  } catch {
    /* Chromium + installed PWA only */
  }
  try {
    const { key } = await getPushKey();
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: b64ToBytes(key),
    });
    const json = sub.toJSON();
    if (json.endpoint && json.keys?.p256dh && json.keys.auth) {
      await savePushSub({
        data: {
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        },
      });
      await pingSelf().catch(() => undefined);
    }
  } catch {
    await showLocal("Hunt alerts are on. Sign in so trades and arena hits can reach you.");
    return "on";
  }
  await showLocal("Hunt alerts are on. You'll get raids, trades, and arena pings.");
  return "on";
}

export async function disableHuntAlerts(): Promise<void> {
  try {
    localStorage.setItem(FLAG, "0");
  } catch {
    /* ignore */
  }
  void queueBackgroundSync({ alerts: false });
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    try {
      await dropPushSub({ data: { endpoint: sub.endpoint } });
    } catch {
      /* signed out */
    }
    await sub.unsubscribe().catch(() => undefined);
  }
}

export async function sendTestAlert(): Promise<void> {
  if (Notification.permission !== "granted") throw new Error("Turn hunt alerts on first.");
  try {
    await pingSelf();
  } catch {
    await showLocal("Test ping. If you can read this, alerts work on this phone.");
  }
}
