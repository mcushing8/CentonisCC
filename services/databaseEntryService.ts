import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DatabaseEntry } from "@/types/models";

function nowIso(): string {
  return new Date().toISOString();
}

export type DatabaseEntryType = "weekly" | "monthly" | "quarterly" | "yearly";

export async function createDatabaseEntry(
  workspaceId: string,
  userId: string,
  data: {
    databaseType: DatabaseEntryType;
    title: string;
    period: string;
    date: string;
  }
): Promise<string> {
  const timestamp = nowIso();
  const payload: Omit<DatabaseEntry, "id"> = {
    workspaceId,
    createdByUserId: userId,
    databaseType: data.databaseType,
    title: data.title,
    content: "",
    period: data.period,
    date: data.date,
    status: "not_started",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const docRef = await addDoc(collection(db, "databaseEntries"), payload);
  return docRef.id;
}

export async function listDatabaseEntries(
  workspaceId: string,
  databaseType: DatabaseEntryType
): Promise<DatabaseEntry[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "databaseEntries"),
      where("workspaceId", "==", workspaceId),
      where("databaseType", "==", databaseType)
    )
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as DatabaseEntry
  );
}

export async function getDatabaseEntry(
  entryId: string
): Promise<DatabaseEntry | null> {
  const snapshot = await getDoc(doc(db, "databaseEntries", entryId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as DatabaseEntry;
}

export async function updateDatabaseEntry(
  entryId: string,
  data: Partial<Pick<DatabaseEntry, "title" | "content" | "period" | "date" | "status" | "coverImage" | "icon">>
) {
  await updateDoc(doc(db, "databaseEntries", entryId), {
    ...data,
    updatedAt: nowIso(),
  });
}

export async function deleteDatabaseEntry(entryId: string) {
  await deleteDoc(doc(db, "databaseEntries", entryId));
}
