import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

interface ExamAuthContextType {
    examUser: User | null;
    isExamAuthenticated: boolean;
    examLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    examSignup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    examGoogleLogin: () => Promise<{ success: boolean; error?: string }>;
    examLogout: () => void;
    isExamLoading: boolean;
}

const ExamAuthContext = createContext<ExamAuthContextType | undefined>(undefined);

export const ExamAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [examUser, setExamUser] = useState<User | null>(null);
    const [isExamLoading, setIsExamLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setExamUser(user);
            setIsExamLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const examLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: !!userCredential.user };
        } catch (e: any) {
            return { success: false, error: e.message || "An unexpected error occurred" };
        }
    };

    const examSignup = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return { success: !!userCredential.user };
        } catch (e: any) {
            return { success: false, error: e.message || "Signup failed." };
        }
    };

    const examLogout = async () => {
        await signOut(auth);
    };

    const examGoogleLogin = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            return { success: !!userCredential.user };
        } catch (e: any) {
            return { success: false, error: e.message || "Google Login failed." };
        }
    };

    return (
        <ExamAuthContext.Provider value={{ examUser, isExamAuthenticated: !!examUser, examLogin, examSignup, examGoogleLogin, examLogout, isExamLoading }}>
            {children}
        </ExamAuthContext.Provider>
    );
};

export const useExamAuth = () => {
    const context = useContext(ExamAuthContext);
    if (context === undefined) {
        throw new Error("useExamAuth must be used within an ExamAuthProvider");
    }
    return context;
};
