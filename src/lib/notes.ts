import { ref, push, set, get, remove, update } from "firebase/database";
import { realtimeDb } from "./firebase";

export interface PatientNote {
    id?: string;
    patientId: string;
    title: string;
    content: string;
    category: "Evolução" | "Anamnese" | "Exame" | "Prescrição" | "Outro";
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
}

// Helper to remove undefined fields
function removeUndefinedFields(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            cleaned[key] = obj[key];
        }
    }
    return cleaned;
}

// Save a patient note
export async function saveNote(note: PatientNote, userId: string): Promise<string> {
    try {
        if (note.id) {
            // Update existing note
            const noteRef = ref(realtimeDb, `users/${userId}/notes/${note.id}`);
            const updateData = removeUndefinedFields({
                title: note.title,
                content: note.content,
                category: note.category,
                updatedAt: new Date().toISOString(),
            });
            await update(noteRef, updateData);
            return note.id;
        } else {
            // Create new note
            const notesRef = ref(realtimeDb, `users/${userId}/notes`);
            const newNoteRef = push(notesRef);
            const noteData = removeUndefinedFields({
                patientId: note.patientId,
                title: note.title,
                content: note.content,
                category: note.category,
                createdAt: new Date().toISOString(),
                createdBy: userId,
            });
            await set(newNoteRef, noteData);
            return newNoteRef.key!;
        }
    } catch (error) {
        console.error("Error saving note:", error);
        throw error;
    }
}

// Get all notes for a patient
export async function getPatientNotes(userId: string, patientId: string): Promise<PatientNote[]> {
    try {
        const notesRef = ref(realtimeDb, `users/${userId}/notes`);
        const snapshot = await get(notesRef);

        if (!snapshot.exists()) {
            return [];
        }

        const notesData = snapshot.val();
        const notes: PatientNote[] = [];

        for (const key in notesData) {
            if (notesData[key].patientId === patientId) {
                notes.push({
                    id: key,
                    ...notesData[key],
                });
            }
        }

        // Sort by creation date (newest first)
        notes.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        return notes;
    } catch (error) {
        console.error("Error fetching notes:", error);
        return [];
    }
}

// Get all notes (for user)
export async function getAllNotes(userId: string): Promise<PatientNote[]> {
    try {
        const notesRef = ref(realtimeDb, `users/${userId}/notes`);
        const snapshot = await get(notesRef);

        if (!snapshot.exists()) {
            return [];
        }

        const notesData = snapshot.val();
        const notes: PatientNote[] = [];

        for (const key in notesData) {
            notes.push({
                id: key,
                ...notesData[key],
            });
        }

        // Sort by creation date (newest first)
        notes.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        return notes;
    } catch (error) {
        console.error("Error fetching all notes:", error);
        return [];
    }
}

// Delete a note
export async function deleteNote(noteId: string, userId: string): Promise<void> {
    try {
        const noteRef = ref(realtimeDb, `users/${userId}/notes/${noteId}`);
        await remove(noteRef);
    } catch (error) {
        console.error("Error deleting note:", error);
        throw error;
    }
}
