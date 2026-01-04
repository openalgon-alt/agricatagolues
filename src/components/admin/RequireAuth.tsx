import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
};
