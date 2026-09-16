const CACHE = "soulrift-shell-v8";
const PRECACHE = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];
const BG_DB = "soulrift-bg";
const BG_STORE = "kv";
const BG_TAG = "soulrift-sync";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => {
        if (url.pathname === "/" || url.pathname === "") return caches.match("/");
        return new Response("Offline", { status: 503, statusText: "Offline" });
      }),
    );
    return;
  }
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (
          res.ok &&
          (url.pathname.endsWith(".png") ||
            url.pathname.endsWith(".webmanifest") ||
            url.pathname === "/")
        ) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => undefined);
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/"))),
  );
});

function bgPayload() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BG_DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(BG_STORE)) req.result.createObjectStore(BG_STORE);
    };
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const tx = req.result.transaction(BG_STORE, "readonly");
      const get = tx.objectStore(BG_STORE).get("payload");
      get.onsuccess = () => resolve(get.result || {});
      get.onerror = () => reject(get.error);
    };
  });
}

async function flushBg() {
  const payload = (await bgPayload().catch(() => ({}))) || {};
  if (!payload.save && !payload.name) return;
  const res = await fetch("/api/bg", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      save: payload.save,
      name: payload.name,
      power: payload.power,
      maxFloor: payload.maxFloor,
    }),
  });
  if (res.status === 401) return;
  if (!res.ok) throw new Error("bg sync failed");
}

self.addEventListener("sync", (event) => {
  if (event.tag === BG_TAG || event.tag === "hunt-ping") {
    event.waitUntil(flushBg());
  }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag !== BG_TAG && event.tag !== "hunt-ping") return;
  event.waitUntil(
    (async () => {
      await flushBg();
      const payload = (await bgPayload().catch(() => ({}))) || {};
      if (payload.alerts === false) return;
      await self.registration.showNotification("Soulrift Crusher", {
        body: "The rift kept moving. Cloud save synced. Idle gold is stacking.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: "/" },
      });
    })(),
  );
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Soulrift Crusher",
    body: "The rift is stirring.",
    url: "/",
  };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    try {
      data.body = event.data ? event.data.text() : data.body;
    } catch {
      /* empty push */
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Soulrift Crusher", {
      body: data.body || "The rift is stirring.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate?.(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
