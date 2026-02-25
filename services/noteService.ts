/* This file handles note CRUD operations in Firestore. */
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
import type { Note } from "@/types/models";

function nowIso(): string {
  return new Date().toISOString();
}

export async function createNote(userId: string): Promise<string> {
  const timestamp = nowIso();
  const payload: Omit<Note, "id"> = {
    userId,
    title: "Untitled",
    content: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const docRef = await addDoc(collection(db, "notes"), payload);
  return docRef.id;
}

export async function listNotes(userId: string): Promise<Note[]> {
  const snapshot = await getDocs(
    query(collection(db, "notes"), where("userId", "==", userId))
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as Note
  );
}

export async function getNoteById(noteId: string): Promise<Note | null> {
  const snapshot = await getDoc(doc(db, "notes", noteId));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...(snapshot.data() as Omit<Note, "id">) };
}

export async function updateNote(
  noteId: string,
  data: Partial<Pick<Note, "title" | "content">>
) {
  await updateDoc(doc(db, "notes", noteId), {
    ...data,
    updatedAt: nowIso(),
  });
}

export async function deleteNote(noteId: string) {
  await deleteDoc(doc(db, "notes", noteId));
}
