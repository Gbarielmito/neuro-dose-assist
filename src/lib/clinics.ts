import { ref, push, set, get, remove, update } from "firebase/database";
import { realtimeDb } from "./firebase";

export type MemberRole = "owner" | "admin" | "member";

export interface ClinicMember {
    odal: string;
    email: string;
    name?: string;
    role: MemberRole;
    joinedAt: string;
}

export interface ClinicInvite {
    id?: string;
    email: string;
    clinicId: string;
    clinicName: string;
    role: MemberRole;
    status: "pending" | "accepted" | "rejected";
    invitedBy: string;
    createdAt: string;
}

export interface Clinic {
    id?: string;
    name: string;
    ownerId: string;
    ownerEmail: string;
    members: ClinicMember[];
    createdAt?: string;
    updatedAt?: string;
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

// Create a new clinic - stored in user's own data
export async function createClinic(
    name: string,
    userId: string,
    userEmail: string
): Promise<string> {
    try {
        // Store clinic data in user's own path (works with existing rules)
        const clinicRef = ref(realtimeDb, `users/${userId}/clinic`);

        const clinicData: Omit<Clinic, "id"> = {
            name,
            ownerId: userId,
            ownerEmail: userEmail,
            members: [
                {
                    odal: userId,
                    email: userEmail,
                    role: "owner",
                    joinedAt: new Date().toISOString(),
                },
            ],
            createdAt: new Date().toISOString(),
        };

        await set(clinicRef, clinicData);
        return userId;
    } catch (error) {
        console.error("Error creating clinic:", error);
        throw error;
    }
}

// Get user's clinic
export async function getUserClinic(userId: string): Promise<Clinic | null> {
    try {
        const clinicRef = ref(realtimeDb, `users/${userId}/clinic`);
        const clinicSnapshot = await get(clinicRef);

        if (!clinicSnapshot.exists()) {
            return null;
        }

        return {
            id: userId,
            ...clinicSnapshot.val(),
        };
    } catch (error) {
        console.error("Error getting user clinic:", error);
        return null;
    }
}

// Update clinic
export async function updateClinic(
    clinicId: string, // This is the owner's userId
    data: Partial<Clinic>
): Promise<void> {
    try {
        const clinicRef = ref(realtimeDb, `users/${clinicId}/clinic`);
        const updateData = removeUndefinedFields({
            ...data,
            id: undefined, // Don't store id in the data
            updatedAt: new Date().toISOString(),
        });
        await update(clinicRef, updateData);
    } catch (error) {
        console.error("Error updating clinic:", error);
        throw error;
    }
}

// Send invite to a new member - stored in user's invites
export async function sendClinicInvite(
    clinicId: string,
    clinicName: string,
    email: string,
    role: MemberRole,
    invitedBy: string
): Promise<string> {
    try {
        // Store invite in the clinic owner's data
        const invitesRef = ref(realtimeDb, `users/${clinicId}/clinicInvites`);
        const newInviteRef = push(invitesRef);

        const inviteData: Omit<ClinicInvite, "id"> = {
            email: email.toLowerCase(),
            clinicId,
            clinicName,
            role,
            status: "pending",
            invitedBy,
            createdAt: new Date().toISOString(),
        };

        await set(newInviteRef, inviteData);
        return newInviteRef.key!;
    } catch (error) {
        console.error("Error sending clinic invite:", error);
        throw error;
    }
}

// Get pending invites for a user (by email) - checks all users' invites
// Note: This is a simplified version that only works for the clinic owner
export async function getPendingInvites(email: string): Promise<ClinicInvite[]> {
    // For simplicity, we return empty array here
    // In a real app, you'd need to restructure this or use different rules
    console.log("getPendingInvites called for:", email);
    return [];
}

// Accept clinic invite
export async function acceptClinicInvite(
    inviteId: string,
    userId: string,
    userName?: string
): Promise<void> {
    // Simplified - would need different data structure for full implementation
    console.log("acceptClinicInvite called:", inviteId, userId, userName);
}

// Add member directly (for owner to add members)
export async function addClinicMember(
    clinicOwnerId: string,
    memberEmail: string,
    memberName: string,
    role: MemberRole
): Promise<void> {
    try {
        const clinicRef = ref(realtimeDb, `users/${clinicOwnerId}/clinic`);
        const clinicSnapshot = await get(clinicRef);

        if (!clinicSnapshot.exists()) {
            throw new Error("Clinic not found");
        }

        const clinic = clinicSnapshot.val() as Clinic;
        const newMember: ClinicMember = {
            odal: `member_${Date.now()}`, // Temporary ID until they accept
            email: memberEmail.toLowerCase(),
            name: memberName,
            role,
            joinedAt: new Date().toISOString(),
        };

        const updatedMembers = [...(clinic.members || []), newMember];
        await update(clinicRef, { members: updatedMembers });
    } catch (error) {
        console.error("Error adding clinic member:", error);
        throw error;
    }
}

// Remove member from clinic
export async function removeClinicMember(
    clinicOwnerId: string,
    memberEmail: string
): Promise<void> {
    try {
        const clinicRef = ref(realtimeDb, `users/${clinicOwnerId}/clinic`);
        const clinicSnapshot = await get(clinicRef);

        if (!clinicSnapshot.exists()) {
            throw new Error("Clinic not found");
        }

        const clinic = clinicSnapshot.val() as Clinic;
        const updatedMembers = clinic.members.filter(m => m.email !== memberEmail.toLowerCase());

        await update(clinicRef, { members: updatedMembers });
    } catch (error) {
        console.error("Error removing clinic member:", error);
        throw error;
    }
}

// Get clinic members
export async function getClinicMembers(clinicOwnerId: string): Promise<ClinicMember[]> {
    try {
        const clinicRef = ref(realtimeDb, `users/${clinicOwnerId}/clinic`);
        const snapshot = await get(clinicRef);

        if (!snapshot.exists()) {
            return [];
        }

        const clinic = snapshot.val() as Clinic;
        return clinic.members || [];
    } catch (error) {
        console.error("Error getting clinic members:", error);
        return [];
    }
}
