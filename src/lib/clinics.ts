import { ref, push, set, get, remove, update } from "firebase/database";
import { realtimeDb } from "./firebase";
import { sendInviteEmail, generateInviteLink } from "./email";

export type MemberRole = "owner" | "admin" | "member";

export interface ClinicMember {
    uid: string;
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
    invitedByName?: string;
    createdAt: string;
}

export interface ClinicMembership {
    clinicOwnerId: string;
    clinicName: string;
    role: MemberRole;
    joinedAt: string;
}

export interface Clinic {
    id?: string;
    name: string;
    ownerId: string;
    ownerEmail: string;
    members: ClinicMember[];
    memberUids?: Record<string, boolean>;
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
        const clinicRef = ref(realtimeDb, `users/${userId}/clinic`);

        const clinicData: Omit<Clinic, "id"> = {
            name,
            ownerId: userId,
            ownerEmail: userEmail,
            members: [
                {
                    uid: userId,
                    email: userEmail,
                    role: "owner",
                    joinedAt: new Date().toISOString(),
                },
            ],
            memberUids: {
                [userId]: true,
            },
            createdAt: new Date().toISOString(),
        };

        await set(clinicRef, clinicData);
        return userId;
    } catch (error) {
        console.error("Error creating clinic:", error);
        throw error;
    }
}

// Get user's clinic (own or as member)
export async function getUserClinic(userId: string): Promise<Clinic | null> {
    try {
        // 1. Check if user owns a clinic
        const clinicRef = ref(realtimeDb, `users/${userId}/clinic`);
        const clinicSnapshot = await get(clinicRef);

        if (clinicSnapshot.exists()) {
            return {
                id: userId,
                ...clinicSnapshot.val(),
            };
        }

        // 2. Check if user is a member of another clinic
        const membership = await getClinicMembership(userId);
        if (membership) {
            const ownerClinicRef = ref(realtimeDb, `users/${membership.clinicOwnerId}/clinic`);
            const ownerSnapshot = await get(ownerClinicRef);
            if (ownerSnapshot.exists()) {
                return {
                    id: membership.clinicOwnerId,
                    ...ownerSnapshot.val(),
                };
            }
        }

        return null;
    } catch (error) {
        console.error("Error getting user clinic:", error);
        return null;
    }
}

// Get clinic membership for a user (if they are a member of someone else's clinic)
export async function getClinicMembership(userId: string): Promise<ClinicMembership | null> {
    try {
        const membershipRef = ref(realtimeDb, `users/${userId}/clinicMembership`);
        const snapshot = await get(membershipRef);

        if (snapshot.exists()) {
            return snapshot.val() as ClinicMembership;
        }
        return null;
    } catch (error) {
        console.error("Error getting clinic membership:", error);
        return null;
    }
}

// Get effective user ID for data access
// Returns the clinic owner's ID if the user is a member, otherwise returns own ID
export async function getEffectiveUserId(userId: string): Promise<string> {
    try {
        // Check if user owns a clinic — they use their own ID
        const clinicRef = ref(realtimeDb, `users/${userId}/clinic`);
        const clinicSnapshot = await get(clinicRef);
        if (clinicSnapshot.exists()) {
            return userId;
        }

        // Check if user is a member of another clinic
        const membership = await getClinicMembership(userId);
        if (membership) {
            return membership.clinicOwnerId;
        }

        // Independent user
        return userId;
    } catch (error) {
        console.error("Error getting effective user ID:", error);
        return userId;
    }
}

// Update clinic
export async function updateClinic(
    clinicId: string,
    data: Partial<Clinic>
): Promise<void> {
    try {
        const clinicRef = ref(realtimeDb, `users/${clinicId}/clinic`);
        const updateData = removeUndefinedFields({
            ...data,
            id: undefined,
            updatedAt: new Date().toISOString(),
        });
        await update(clinicRef, updateData);
    } catch (error) {
        console.error("Error updating clinic:", error);
        throw error;
    }
}

// Send invite to a new member
export async function sendClinicInvite(
    clinicId: string,
    clinicName: string,
    email: string,
    role: MemberRole,
    invitedBy: string,
    invitedByName?: string
): Promise<{ inviteId: string; emailSent: boolean }> {
    try {
        const invitesRef = ref(realtimeDb, `users/${clinicId}/clinicInvites`);
        const newInviteRef = push(invitesRef);
        const inviteId = newInviteRef.key!;

        const inviteData: Omit<ClinicInvite, "id"> = {
            email: email.toLowerCase(),
            clinicId,
            clinicName,
            role,
            status: "pending",
            invitedBy,
            invitedByName,
            createdAt: new Date().toISOString(),
        };

        await set(newInviteRef, inviteData);

        // Generate invite link and send email
        const inviteLink = generateInviteLink(inviteId, clinicId);
        const emailSent = await sendInviteEmail({
            toEmail: email.toLowerCase(),
            clinicName,
            senderName: invitedByName || "Um usuário",
            role,
            inviteLink,
        });

        return { inviteId, emailSent };
    } catch (error) {
        console.error("Error sending clinic invite:", error);
        throw error;
    }
}

// Get a specific invite by ID from a clinic
export async function getInviteById(
    clinicId: string,
    inviteId: string
): Promise<ClinicInvite | null> {
    try {
        const inviteRef = ref(realtimeDb, `users/${clinicId}/clinicInvites/${inviteId}`);
        const snapshot = await get(inviteRef);

        if (snapshot.exists()) {
            return {
                id: inviteId,
                ...snapshot.val(),
            } as ClinicInvite;
        }
        return null;
    } catch (error) {
        console.error("Error getting invite:", error);
        return null;
    }
}

// Get pending invites for a user by email from a specific clinic
export async function getPendingInvitesFromClinic(
    clinicId: string,
    email: string
): Promise<ClinicInvite[]> {
    try {
        const invitesRef = ref(realtimeDb, `users/${clinicId}/clinicInvites`);
        const snapshot = await get(invitesRef);

        if (!snapshot.exists()) return [];

        const invitesData = snapshot.val();
        const invites: ClinicInvite[] = [];

        Object.entries(invitesData).forEach(([key, value]) => {
            const invite = value as Omit<ClinicInvite, "id">;
            if (
                invite.email === email.toLowerCase() &&
                invite.status === "pending"
            ) {
                invites.push({ id: key, ...invite });
            }
        });

        return invites;
    } catch (error) {
        console.error("Error getting pending invites:", error);
        return [];
    }
}

// Accept clinic invite — the core of the invite system
export async function acceptClinicInvite(
    inviteId: string,
    clinicId: string,
    userId: string,
    userEmail: string,
    userName?: string
): Promise<void> {
    try {
        // 1. Read the invite
        const inviteRef = ref(realtimeDb, `users/${clinicId}/clinicInvites/${inviteId}`);
        const inviteSnapshot = await get(inviteRef);

        if (!inviteSnapshot.exists()) {
            throw new Error("Convite não encontrado");
        }

        const invite = inviteSnapshot.val() as ClinicInvite;

        if (invite.status !== "pending") {
            throw new Error("Este convite já foi utilizado");
        }

        // 2. Read the clinic to get current members
        const clinicRef = ref(realtimeDb, `users/${clinicId}/clinic`);
        const clinicSnapshot = await get(clinicRef);

        if (!clinicSnapshot.exists()) {
            throw new Error("Clínica não encontrada");
        }

        const clinic = clinicSnapshot.val() as Clinic;

        // 3. Add user to clinic members list
        const newMember: ClinicMember = {
            uid: userId,
            email: userEmail.toLowerCase(),
            name: userName || userEmail.split("@")[0],
            role: invite.role,
            joinedAt: new Date().toISOString(),
        };

        const updatedMembers = [...(clinic.members || []), newMember];
        const updatedMemberUids = {
            ...(clinic.memberUids || {}),
            [userId]: true,
        };

        await update(clinicRef, {
            members: updatedMembers,
            memberUids: updatedMemberUids,
            updatedAt: new Date().toISOString(),
        });

        // 4. Save membership on the member's profile
        const membershipRef = ref(realtimeDb, `users/${userId}/clinicMembership`);
        const membershipData: ClinicMembership = {
            clinicOwnerId: clinicId,
            clinicName: clinic.name,
            role: invite.role,
            joinedAt: new Date().toISOString(),
        };
        await set(membershipRef, membershipData);

        // 5. Mark invite as accepted
        await update(inviteRef, { status: "accepted" });

        console.log("Invite accepted successfully for user:", userId);
    } catch (error) {
        console.error("Error accepting clinic invite:", error);
        throw error;
    }
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
            uid: `member_${Date.now()}`,
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
    memberUid: string
): Promise<void> {
    try {
        const clinicRef = ref(realtimeDb, `users/${clinicOwnerId}/clinic`);
        const clinicSnapshot = await get(clinicRef);

        if (!clinicSnapshot.exists()) {
            throw new Error("Clinic not found");
        }

        const clinic = clinicSnapshot.val() as Clinic;
        const updatedMembers = clinic.members.filter(m => m.uid !== memberUid);

        // Remove from memberUids as well
        const updatedMemberUids = { ...(clinic.memberUids || {}) };
        delete updatedMemberUids[memberUid];

        await update(clinicRef, {
            members: updatedMembers,
            memberUids: updatedMemberUids,
        });

        // Remove membership from the member's profile
        const membershipRef = ref(realtimeDb, `users/${memberUid}/clinicMembership`);
        await remove(membershipRef);
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
