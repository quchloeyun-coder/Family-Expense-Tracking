// storage.js - 本地 IndexedDB + Firestore 同步层
// 设计：本地优先，写操作立即落本地，标记 _pending；同步时推送 pending 到云端，再拉取云端合并
//
// 数据模型：
//   records: { id, ...record, updatedAt, _pending?, _deleted? }
//   meta: { familyId, lastSyncAt, currencies, ... }
//
// 合并策略：
//   - 按 id 去重
//   - 同 id 取 updatedAt 较新的
//   - _deleted: true 的记录是 tombstone，删除事件用它传播；本地展示时过滤掉

const DB_NAME = 'family-budget';
const DB_VERSION = 1;
const STORE_RECORDS = 'records';
const STORE_META = 'meta';

let dbPromise = null;
function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_RECORDS)) {
        db.createObjectStore(STORE_RECORDS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
  return dbPromise;
}

async function tx(store, mode = 'readonly') {
  const db = await openDB();
  return db.transaction(store, mode).objectStore(store);
}

// ---------- Records ----------
export async function getAllRecords() {
  const s = await tx(STORE_RECORDS);
  return new Promise((resolve, reject) => {
    const req = s.getAll();
    req.onsuccess = () => resolve((req.result || []).filter(r => !r._deleted));
    req.onerror = () => reject(req.error);
  });
}

export async function getAllRecordsRaw() {
  // 包括 tombstones，用于同步
  const s = await tx(STORE_RECORDS);
  return new Promise((resolve, reject) => {
    const req = s.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function putRecord(record) {
  const s = await tx(STORE_RECORDS, 'readwrite');
  const r = { ...record, updatedAt: Date.now(), _pending: true };
  return new Promise((resolve, reject) => {
    const req = s.put(r);
    req.onsuccess = () => resolve(r);
    req.onerror = () => reject(req.error);
  });
}

export async function softDeleteRecord(id) {
  const s = await tx(STORE_RECORDS, 'readwrite');
  return new Promise((resolve, reject) => {
    const getReq = s.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) { resolve(null); return; }
      const tombstone = { ...existing, _deleted: true, updatedAt: Date.now(), _pending: true };
      const putReq = s.put(tombstone);
      putReq.onsuccess = () => resolve(tombstone);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function clearAllRecords() {
  // 把所有记录标记为 tombstone（软删除），让对方下次同步时也能删掉
  const all = await getAllRecordsRaw();
  const s = await tx(STORE_RECORDS, 'readwrite');
  const now = Date.now();
  return Promise.all(all.map(r => new Promise((res, rej) => {
    const req = s.put({ ...r, _deleted: true, updatedAt: now, _pending: true });
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  })));
}

// 应用同步后的远端记录（不打 _pending 标记）
async function applyRemoteRecord(record) {
  const s = await tx(STORE_RECORDS, 'readwrite');
  return new Promise((resolve, reject) => {
    const getReq = s.get(record.id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      // 合并：取 updatedAt 较新的；如果本地有 _pending 且更新，保留本地
      if (existing && existing.updatedAt >= record.updatedAt) {
        resolve(existing);
        return;
      }
      const merged = { ...record, _pending: false };
      const putReq = s.put(merged);
      putReq.onsuccess = () => resolve(merged);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

async function markSynced(id) {
  const s = await tx(STORE_RECORDS, 'readwrite');
  return new Promise((resolve, reject) => {
    const getReq = s.get(id);
    getReq.onsuccess = () => {
      const r = getReq.result;
      if (!r) { resolve(); return; }
      const putReq = s.put({ ...r, _pending: false });
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// ---------- Meta ----------
export async function getMeta(key, fallback = null) {
  const s = await tx(STORE_META);
  return new Promise((resolve, reject) => {
    const req = s.get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : fallback);
    req.onerror = () => reject(req.error);
  });
}

export async function setMeta(key, value) {
  const s = await tx(STORE_META, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = s.put({ key, value });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ---------- Firestore Sync ----------
// 调用方提供 firebase 的 firestore 实例和 familyId
// 同步流程：
//  1) 把本地 _pending 记录 push 到 families/{familyId}/records
//  2) 拉取 families/{familyId}/records，合并到本地
//  3) 更新 lastSyncAt
//
// 增量优化：第二步只拉 updatedAt > lastSyncAt 的记录

export async function syncWithFirestore(firestore, familyId, firebaseModule) {
  if (!firestore || !familyId) throw new Error('Firestore 或 familyId 缺失');
  const { collection, doc, getDocs, setDoc, query, where } = firebaseModule;

  // 1) 推送 pending
  const all = await getAllRecordsRaw();
  const pending = all.filter(r => r._pending);
  const recordsCol = collection(firestore, 'families', familyId, 'records');
  for (const r of pending) {
    const { _pending, ...rest } = r;
    await setDoc(doc(recordsCol, r.id), rest);
    await markSynced(r.id);
  }

  // 2) 拉取增量
  const lastSync = (await getMeta('lastSyncAt', 0)) || 0;
  let snapshot;
  if (lastSync > 0) {
    const q = query(recordsCol, where('updatedAt', '>', lastSync));
    snapshot = await getDocs(q);
  } else {
    snapshot = await getDocs(recordsCol);
  }
  let pulled = 0;
  for (const docSnap of snapshot.docs) {
    await applyRemoteRecord(docSnap.data());
    pulled++;
  }

  // 3) 更新时间戳
  await setMeta('lastSyncAt', Date.now());
  return { pushed: pending.length, pulled };
}

// ---------- Family ID 管理 ----------
export async function getFamilyId() {
  return getMeta('familyId', null);
}
export async function setFamilyId(id) {
  return setMeta('familyId', id);
}
export function generatePairCode() {
  // 6 位大写字母+数字（去掉易混淆的 0/O/1/I）
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
