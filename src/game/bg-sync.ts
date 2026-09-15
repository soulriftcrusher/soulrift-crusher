const DB_NAME = "soulrift-bg";
const STORE = "kv";
const TAG = "soulrift-sync";

export type BgPayload = {
  save?: string;
  name?: string;
  power?: number;
  maxFloor?: number;
  avatar?: string;
  alerts?: boolean;
  at?: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readPayload(): Promise<BgPayload> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get("payload");
    req.onsuccess = () => resolve((req.result as BgPayload) ?? {});
    req.onerror = () => reject(req.error);
  });
}

async function writePayload(next: BgPayload): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(next, "payload");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

type SyncReg = ServiceWorkerRegistration & {
  sync?: { register: (tag: string) => Promise<void> };
  periodicSync?: { register: (tag: string, opts: { minInterval: number }) => Promise<void> };
};

async function readyReg(): Promise<SyncReg | null> {
  if (!("serviceWorker" in navigator)) return null;
  return (await navigator.serviceWorker.ready) as SyncReg;
}

export async function queueBackgroundSync(patch: BgPayload): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const cur = await readPayload().catch(() => ({} as BgPayload));
  await writePayload({ ...cur, ...patch, at: Date.now() });
  const reg = await readyReg();
  try {
    await reg?.sync?.register(TAG);
  } catch {
    void flushBackgroundNow();
  }
}

export async function registerBackgroundHunt(): Promise<boolean> {
  const reg = await readyReg();
  if (!reg) return false;
  let ok = false;
  try {
    await reg.sync?.register(TAG);
    ok = true;
  } catch {
    /* one-shot sync missing */
  }
  try {
    await reg.periodicSync?.register(TAG, { minInterval: 15 * 60 * 1000 });
    ok = true;
  } catch {
    /* installed Chromium PWAs only */
  }
  return ok;
}

export async function flushBackgroundNow(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const payload = await readPayload().catch(() => ({} as BgPayload));
  if (!payload.save && !payload.name) return;
  await fetch("/api/bg", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      save: payload.save,
      name: payload.name,
      power: payload.power,
      maxFloor: payload.maxFloor,
      avatar: payload.avatar,
    }),
  });
}
