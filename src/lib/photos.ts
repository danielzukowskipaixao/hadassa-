import localforage from "localforage";

export type PhotoItem = {
  id: string;
  dataUrl: string;
  description: string;
  createdAt: string; // ISO
};

const KEY = "memorias:v1:photos";

function isBrowser() {
  return typeof window !== "undefined";
}

// Configure a dedicated store
if (isBrowser()) {
  try {
    localforage.config({
      name: "memorias",
      storeName: "v1_photos",
      description: "Photos for Memórias de Radassa e Daniel",
    });
  } catch {
    // ignore
  }
}

function newId() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function readAll(): Promise<PhotoItem[]> {
  if (!isBrowser()) return [];
  const data = await localforage.getItem<PhotoItem[] | null>(KEY);
  return Array.isArray(data) ? data : [];
}

async function writeAll(items: PhotoItem[]): Promise<void> {
  if (!isBrowser()) return;
  await localforage.setItem(KEY, items);
}

export async function getAllPhotos(): Promise<PhotoItem[]> {
  const items = await readAll();
  return items
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addPhoto(item: Omit<PhotoItem, "id" | "createdAt">): Promise<PhotoItem> {
  const next: PhotoItem = {
    id: newId(),
    dataUrl: item.dataUrl,
    description: item.description ?? "",
    createdAt: new Date().toISOString(),
  };
  const items = await readAll();
  items.push(next);
  await writeAll(items);
  return next;
}

export async function removePhoto(id: string): Promise<void> {
  const items = await readAll();
  const filtered = items.filter((p) => p.id !== id);
  await writeAll(filtered);
}

export async function clearPhotos(): Promise<void> {
  await writeAll([]);
}

export async function importPhotos(json: PhotoItem[]): Promise<number> {
  if (!Array.isArray(json)) return 0;
  const now = new Date().toISOString();
  const incoming: PhotoItem[] = [];
  for (const p of json) {
    if (p && typeof p === "object" && typeof p.dataUrl === "string") {
      incoming.push({
        id: typeof p.id === "string" ? p.id : newId(),
        dataUrl: p.dataUrl,
        description: typeof p.description === "string" ? p.description : "",
        createdAt: typeof p.createdAt === "string" ? p.createdAt : now,
      });
    }
  }
  if (!incoming.length) return 0;
  const current = await readAll();
  const merged = [...current, ...incoming];
  await writeAll(merged);
  return incoming.length;
}

export async function exportPhotos(): Promise<PhotoItem[]> {
  return await getAllPhotos();
}
