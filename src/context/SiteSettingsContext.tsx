import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/services/examDataService";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ActiveExam = "practical" | "ao-aao";

interface SiteSettingsContextType {
    activeExam: ActiveExam;
    isLoading: boolean;
    setActiveExam: (exam: ActiveExam) => Promise<void>;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_EXAM: ActiveExam = "practical";
const ACTIVE_EXAM_KEY = "active_exam";
const LOCAL_STORAGE_KEY = "admin_active_exam";

const SiteSettingsContext = createContext<SiteSettingsContextType>({
    activeExam: DEFAULT_EXAM,
    isLoading: true,
    setActiveExam: async () => {},
});

// ─── Helper: read from API (Google Cloud SQL) ─────────────────────────────────
async function fetchActiveExamFromApi(): Promise<ActiveExam | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/api`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "get-settings" })
        });
        if (res.ok) {
            const data = await res.json();
            if (data?.[ACTIVE_EXAM_KEY] === "ao-aao" || data?.[ACTIVE_EXAM_KEY] === "practical") {
                return data[ACTIVE_EXAM_KEY] as ActiveExam;
            }
        }
        return null;
    } catch (e) {
        console.warn("[SiteSettings] API read error:", e);
        return null;
    }
}

// ─── Helper: write to API (Google Cloud SQL) ──────────────────────────────────
async function saveActiveExamToApi(exam: ActiveExam): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE_URL}/api`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "update-settings",
                payload: {
                    settings: { [ACTIVE_EXAM_KEY]: exam }
                }
            })
        });
        if (res.ok) {
            const data = await res.json();
            return !!data?.success;
        }
        return false;
    } catch (e) {
        console.warn("[SiteSettings] API save failed:", e);
        return false;
    }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Pre-read from localStorage synchronously so first render is instant
    const cachedExam = localStorage.getItem(LOCAL_STORAGE_KEY) as ActiveExam | null;
    const validCache = cachedExam === 'practical' || cachedExam === 'ao-aao';

    const [activeExam, setActiveExamState] = useState<ActiveExam>(validCache ? cachedExam : DEFAULT_EXAM);
    const [isLoading, setIsLoading] = useState(!validCache); // already resolved if cache exists

    // On mount: try API → fallback to localStorage → fallback to default
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            // 1. Quick paint from localStorage (instant)
            const local = localStorage.getItem(LOCAL_STORAGE_KEY) as ActiveExam | null;
            if (local === "practical" || local === "ao-aao") {
                if (!cancelled) setActiveExamState(local);
            }

            // 2. Then fetch authoritative value from API
            const remote = await fetchActiveExamFromApi();
            if (!cancelled) {
                if (remote) {
                    setActiveExamState(remote);
                    localStorage.setItem(LOCAL_STORAGE_KEY, remote);
                }
                setIsLoading(false);
            }
        };

        load();

        // 3. Listen to cross-tab changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === LOCAL_STORAGE_KEY && (e.newValue === "practical" || e.newValue === "ao-aao")) {
                setActiveExamState(e.newValue as ActiveExam);
            }
        };
        window.addEventListener("storage", handleStorageChange);

        return () => {
            cancelled = true;
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const setActiveExam = useCallback(async (exam: ActiveExam) => {
        // Optimistic update — feels instant
        setActiveExamState(exam);
        localStorage.setItem(LOCAL_STORAGE_KEY, exam);

        // Persist to API
        const saved = await saveActiveExamToApi(exam);
        if (!saved) {
            console.warn("[SiteSettings] Falling back to localStorage-only mode");
        }
    }, []);

    return (
        <SiteSettingsContext.Provider value={{ activeExam, isLoading, setActiveExam }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useSiteSettings = () => useContext(SiteSettingsContext);
