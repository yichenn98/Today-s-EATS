import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import type { MealRecord } from "./types";
import { db } from "./firebase";

// --------------------
// Records
// --------------------
export function subscribeRecords(uid: string, cb: (records: MealRecord[]) => void) {
  const colRef = collection(db, "users", uid, "records");

  return onSnapshot(colRef, (snap) => {
    const records = snap.docs.map((d) => d.data() as MealRecord);
    records.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id.localeCompare(b.id)));
    cb(records);
  });
}

export async function upsertRecord(uid: string, record: MealRecord) {
  const ref = doc(db, "users", uid, "records", record.id);

  const cleaned = Object.fromEntries(
    Object.entries(record).filter(([, v]) => v !== undefined)
  );

  await setDoc(ref, cleaned, { merge: true });
}

export async function removeRecord(uid: string, id: string) {
  const ref = doc(db, "users", uid, "records", id);
  await deleteDoc(ref);
}

// --------------------
// Wheel Prefs (NEW)
// --------------------
export type WheelPrefs = {
  customShops?: string[];
  excludedShops?: string[];
  updatedAt?: number; // ✅ 用來防止舊 snapshot 覆蓋新狀態
};

export function subscribeWheelPrefs(uid: string, cb: (prefs: WheelPrefs | null) => void) {
  const ref = doc(db, "users", uid, "wheelPrefs", "default");

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    cb(snap.data() as WheelPrefs);
  });
}

export async function saveWheelPrefs(uid: string, prefs: WheelPrefs) {
  const ref = doc(db, "users", uid, "wheelPrefs", "default");

  // ✅ 一律補上 updatedAt，並 merge，避免覆蓋掉欄位
  const payload: WheelPrefs = {
    customShops: prefs.customShops ?? [],
    excludedShops: prefs.excludedShops ?? [],
    updatedAt: Date.now(),
  };

  await setDoc(ref, payload, { merge: true });
}
