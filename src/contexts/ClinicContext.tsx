import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import {
    getUserClinic,
    getEffectiveUserId,
    getClinicMembership,
    type Clinic,
    type ClinicMembership,
} from "@/lib/clinics";

interface ClinicContextType {
    clinic: Clinic | null;
    membership: ClinicMembership | null;
    effectiveUserId: string | null;
    isOwner: boolean;
    isMember: boolean;
    loading: boolean;
    refreshClinic: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [membership, setMembership] = useState<ClinicMembership | null>(null);
    const [effectiveUserId, setEffectiveUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadClinicData = async () => {
        if (!user) {
            setClinic(null);
            setMembership(null);
            setEffectiveUserId(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Safety timeout: if Firebase takes too long (e.g. on F5 in production),
            // fall back to user's own UID after 8 seconds
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Clinic load timeout")), 8000)
            );

            const dataPromise = Promise.all([
                getUserClinic(user.uid),
                getClinicMembership(user.uid),
                getEffectiveUserId(user.uid),
            ]);

            const [clinicData, membershipData, resolvedUserId] = await Promise.race([
                dataPromise,
                timeoutPromise,
            ]) as [Awaited<ReturnType<typeof getUserClinic>>, Awaited<ReturnType<typeof getClinicMembership>>, string];

            setClinic(clinicData);
            setMembership(membershipData);
            setEffectiveUserId(resolvedUserId);
        } catch (error) {
            console.error("Error loading clinic context:", error);
            // Fallback: use own UID so pages can still load data
            setEffectiveUserId(user.uid);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClinicData();
    }, [user]);

    const isOwner = clinic?.ownerId === user?.uid;
    const isMember = !!membership && !isOwner;

    return (
        <ClinicContext.Provider
            value={{
                clinic,
                membership,
                effectiveUserId,
                isOwner,
                isMember,
                loading,
                refreshClinic: loadClinicData,
            }}
        >
            {children}
        </ClinicContext.Provider>
    );
}

export function useClinic() {
    const context = useContext(ClinicContext);
    if (context === undefined) {
        throw new Error("useClinic deve ser usado dentro de um ClinicProvider");
    }
    return context;
}
