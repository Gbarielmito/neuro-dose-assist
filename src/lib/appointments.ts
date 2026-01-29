import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type AppointmentType = "Consulta" | "Retorno" | "Exame" | "Outro";
export type AppointmentStatus = "Agendada" | "Confirmada" | "Concluída" | "Cancelada";

export interface Appointment {
    id?: string;
    patientId: string;
    patientName: string;
    date: string; // ISO date string (YYYY-MM-DD)
    time: string; // HH:mm format
    duration: number; // in minutes
    type: AppointmentType;
    status: AppointmentStatus;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
}

// Save an appointment
export async function saveAppointment(appointment: Appointment, userId: string): Promise<string> {
    try {
        const appointmentsRef = collection(db, "users", userId, "appointments");

        if (appointment.id) {
            // Update existing appointment
            const appointmentDoc = doc(db, "users", userId, "appointments", appointment.id);
            await updateDoc(appointmentDoc, {
                patientId: appointment.patientId,
                patientName: appointment.patientName,
                date: appointment.date,
                time: appointment.time,
                duration: appointment.duration,
                type: appointment.type,
                status: appointment.status,
                notes: appointment.notes || null,
                updatedAt: new Date().toISOString(),
            });
            return appointment.id;
        } else {
            // Create new appointment
            const docRef = await addDoc(appointmentsRef, {
                patientId: appointment.patientId,
                patientName: appointment.patientName,
                date: appointment.date,
                time: appointment.time,
                duration: appointment.duration,
                type: appointment.type,
                status: appointment.status,
                notes: appointment.notes || null,
                createdAt: new Date().toISOString(),
                createdBy: userId,
            });
            return docRef.id;
        }
    } catch (error) {
        console.error("Error saving appointment:", error);
        throw error;
    }
}

// Get all appointments
export async function getAppointments(userId: string): Promise<Appointment[]> {
    try {
        const appointmentsRef = collection(db, "users", userId, "appointments");
        const q = query(appointmentsRef, orderBy("date", "asc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return [];
        }

        const appointments: Appointment[] = [];
        snapshot.forEach((docSnap) => {
            appointments.push({
                id: docSnap.id,
                ...docSnap.data(),
            } as Appointment);
        });

        // Sort by date and time (upcoming first)
        appointments.sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
            const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
            return dateTimeA - dateTimeB;
        });

        return appointments;
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
    }
}

// Get appointments for a specific date
export async function getAppointmentsByDate(userId: string, date: string): Promise<Appointment[]> {
    try {
        const appointmentsRef = collection(db, "users", userId, "appointments");
        const q = query(appointmentsRef, where("date", "==", date), orderBy("time", "asc"));
        const snapshot = await getDocs(q);

        const appointments: Appointment[] = [];
        snapshot.forEach((docSnap) => {
            appointments.push({
                id: docSnap.id,
                ...docSnap.data(),
            } as Appointment);
        });

        return appointments;
    } catch (error) {
        console.error("Error fetching appointments by date:", error);
        return [];
    }
}

// Get appointments for a specific patient
export async function getPatientAppointments(userId: string, patientId: string): Promise<Appointment[]> {
    try {
        const appointmentsRef = collection(db, "users", userId, "appointments");
        const q = query(appointmentsRef, where("patientId", "==", patientId), orderBy("date", "asc"));
        const snapshot = await getDocs(q);

        const appointments: Appointment[] = [];
        snapshot.forEach((docSnap) => {
            appointments.push({
                id: docSnap.id,
                ...docSnap.data(),
            } as Appointment);
        });

        return appointments;
    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        return [];
    }
}

// Get upcoming appointments (today and future)
export async function getUpcomingAppointments(userId: string): Promise<Appointment[]> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const appointmentsRef = collection(db, "users", userId, "appointments");
        const q = query(
            appointmentsRef,
            where("date", ">=", today),
            orderBy("date", "asc")
        );
        const snapshot = await getDocs(q);

        const appointments: Appointment[] = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Appointment;
            if (data.status !== "Cancelada" && data.status !== "Concluída") {
                appointments.push({
                    id: docSnap.id,
                    ...data,
                });
            }
        });

        return appointments;
    } catch (error) {
        console.error("Error fetching upcoming appointments:", error);
        return [];
    }
}

// Update appointment status
export async function updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    userId: string
): Promise<void> {
    try {
        const appointmentDoc = doc(db, "users", userId, "appointments", appointmentId);
        await updateDoc(appointmentDoc, {
            status,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error updating appointment status:", error);
        throw error;
    }
}

// Delete an appointment
export async function deleteAppointment(appointmentId: string, userId: string): Promise<void> {
    try {
        const appointmentDoc = doc(db, "users", userId, "appointments", appointmentId);
        await deleteDoc(appointmentDoc);
    } catch (error) {
        console.error("Error deleting appointment:", error);
        throw error;
    }
}
