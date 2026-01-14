import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import type { MealRecord } from "./types";
import { db } from "./firebase";

export function subscribeRecords(uid: string, cb: (records: MealRecord[]) => void) {
  const colRef = collection(db, "users", uid, "records");

  return onSnapshot(colRef, (snap) => {
    const records = snap.docs.map((d) => d.data() as MealRecord);

    // 你要不要排序都行；我幫你做個穩定排序（日期新到舊、同日用 id）
    records.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id.localeCompare(b.id)));

    cb(records);
  });
}

export async function upsertRecord(uid: string, record: MealRecord) {
  const ref = doc(db, "users", uid, "records", record.id);

  // 🔑 Firestore 不接受 undefined，先清掉
  const cleaned = Object.fromEntries(
    Object.entries(record).filter(([, v]) => v !== undefined)
  );

  await setDoc(ref, cleaned, { merge: true });
}


export async function removeRecord(uid: string, id: string) {
  const ref = doc(db, "users", uid, "records", id);
  await deleteDoc(ref);
}
