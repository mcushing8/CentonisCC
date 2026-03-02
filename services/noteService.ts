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
import type { RandomNote, NoteFolder } from "@/types/models";

function nowIso(): string {
  return new Date().toISOString();
}

export async function createNote(
  workspaceId: string,
  userId: string,
  folderId: string | null = null
): Promise<string> {
  const timestamp = nowIso();
  const payload: Omit<RandomNote, "id"> = {
    workspaceId,
    createdByUserId: userId,
    title: "Untitled",
    content: "",
    folderId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const docRef = await addDoc(collection(db, "notes"), payload);
  return docRef.id;
}

export async function listNotes(workspaceId: string): Promise<RandomNote[]> {
  const snapshot = await getDocs(
    query(collection(db, "notes"), where("workspaceId", "==", workspaceId))
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as RandomNote
  );
}

export async function getNoteById(noteId: string): Promise<RandomNote | null> {
  const snapshot = await getDoc(doc(db, "notes", noteId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...(snapshot.data() as Omit<RandomNote, "id">) };
}

export async function updateNote(
  noteId: string,
  data: Partial<Pick<RandomNote, "title" | "content" | "folderId" | "coverImage" | "icon">>
) {
  await updateDoc(doc(db, "notes", noteId), {
    ...data,
    updatedAt: nowIso(),
  });
}

export async function deleteNote(noteId: string) {
  await deleteDoc(doc(db, "notes", noteId));
}

export async function createFolder(
  workspaceId: string,
  name: string
): Promise<string> {
  const timestamp = nowIso();
  const payload: Omit<NoteFolder, "id"> = {
    workspaceId,
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const docRef = await addDoc(collection(db, "noteFolders"), payload);
  return docRef.id;
}

export async function listFolders(workspaceId: string): Promise<NoteFolder[]> {
  const snapshot = await getDocs(
    query(collection(db, "noteFolders"), where("workspaceId", "==", workspaceId))
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() } as NoteFolder)
  );
}

export async function updateFolder(folderId: string, name: string) {
  await updateDoc(doc(db, "noteFolders", folderId), {
    name,
    updatedAt: nowIso(),
  });
}

export async function deleteFolder(folderId: string, workspaceId: string) {
  const notesSnapshot = await getDocs(
    query(collection(db, "notes"), where("workspaceId", "==", workspaceId))
  );

  const notesInFolder = notesSnapshot.docs.filter(
    (noteDoc) => noteDoc.data().folderId === folderId
  );

  const updatePromises = notesInFolder.map((noteDoc) =>
    updateDoc(doc(db, "notes", noteDoc.id), { folderId: null })
  );
  await Promise.all(updatePromises);

  await deleteDoc(doc(db, "noteFolders", folderId));
}
