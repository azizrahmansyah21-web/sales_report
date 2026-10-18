/**
 * Modul Antrean Offline PWA (IndexedDB)
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Mengelola penyimpanan lokal asinkron rencana SPK saat perangkat sales
 * berada di luar jangkauan sinyal internet, serta sinkronisasi otomatis ke server.
 */

import { createPlanSpk } from "@/lib/actions/planSpk";

export interface OfflinePlanItem {
  id: string;
  customerName: string;
  unitName: string;
  planDate: string;
  createdAt: string;
  status: "pending" | "syncing" | "failed";
  errorMessage?: string;
}

const DB_NAME = "agung_toyota_sales_pwa";
const DB_VERSION = 1;
const STORE_NAME = "offline_plans";

/**
 * Membuka koneksi database IndexedDB di browser pengguna.
 */
export function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB tidak didukung pada browser ini."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Menyimpan data rencana SPK ke IndexedDB saat jaringan offline.
 */
export async function saveOfflinePlan(data: {
  customerName: string;
  unitName: string;
  planDate: string;
}): Promise<OfflinePlanItem> {
  const db = await openOfflineDB();
  const item: OfflinePlanItem = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    customerName: data.customerName,
    unitName: data.unitName,
    planDate: data.planDate,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mengambil seluruh data rencana SPK yang tersimpan di antrean offline.
 */
export async function getPendingOfflinePlans(): Promise<OfflinePlanItem[]> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return [];
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = (request.result as OfflinePlanItem[]) || [];
        results.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

/**
 * Menghitung total data rencana yang sedang menunggu sinkronisasi di perangkat.
 */
export async function getPendingCount(): Promise<number> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return 0;
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result || 0);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return 0;
  }
}

/**
 * Menghapus satu item dari antrean setelah berhasil terkirim ke server.
 */
export async function removeOfflinePlan(id: string): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Memperbarui status item di antrean offline (misal saat proses sinkronisasi gagal).
 */
export async function updateOfflinePlanStatus(
  id: string,
  status: OfflinePlanItem["status"],
  errorMessage?: string
): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item = getReq.result as OfflinePlanItem | undefined;
      if (!item) {
        resolve();
        return;
      }
      item.status = status;
      if (errorMessage !== undefined) {
        item.errorMessage = errorMessage;
      }
      const putReq = store.put(item);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Memproses pengiriman seluruh antrean offline ke basis data server secara berurutan.
 */
export async function syncOfflinePlans(
  onItemSynced?: (item: OfflinePlanItem) => void,
  onItemFailed?: (item: OfflinePlanItem, err: string) => void
): Promise<{ syncedCount: number; failedCount: number }> {
  const plans = await getPendingOfflinePlans();
  if (plans.length === 0) return { syncedCount: 0, failedCount: 0 };

  let syncedCount = 0;
  let failedCount = 0;

  for (const item of plans) {
    try {
      await updateOfflinePlanStatus(item.id, "syncing");
      const result = await createPlanSpk({
        customerName: item.customerName,
        unitName: item.unitName,
        planDate: item.planDate,
      });

      if (result.success) {
        await removeOfflinePlan(item.id);
        syncedCount++;
        onItemSynced?.(item);
      } else {
        await updateOfflinePlanStatus(item.id, "failed", result.error);
        failedCount++;
        onItemFailed?.(item, result.error);
      }
    } catch (error) {
      // Koneksi terputus kembali di tengah antrean, kembalikan status ke pending
      await updateOfflinePlanStatus(
        item.id,
        "pending",
        error instanceof Error
          ? error.message
          : "Jaringan terputus saat sinkronisasi"
      );
      failedCount++;
      break;
    }
  }

  return { syncedCount, failedCount };
}
