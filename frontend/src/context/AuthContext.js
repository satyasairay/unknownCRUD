import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, } from "react";
import { apiClient, formatError, getCsrfToken } from "../lib/apiClient";
const AuthContext = createContext(undefined);
async function fetchCurrentUser() {
    try {
        const { data } = await apiClient.get("/me", {
            headers: { "cache-control": "no-cache" },
        });
        return data;
    }
    catch (error) {
        return null;
    }
}
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hydrate = useCallback(async () => {
        setLoading(true);
        try {
            await getCsrfToken().catch(() => null);
            const current = await fetchCurrentUser();
            setUser(current);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void hydrate();
    }, [hydrate]);
    const register = useCallback(async ({ email, password, roles }) => {
        setError(null);
        try {
            await apiClient.post("/auth/register", {
                email,
                password,
                roles,
            });
            // automatically login after successful registration
            const { data } = await apiClient.post("/auth/login", {
                email,
                password,
            });
            setUser(data);
        }
        catch (error) {
            setError(formatError(error));
            throw error;
        }
    }, []);
    const login = useCallback(async ({ email, password, otp }) => {
        setError(null);
        try {
            const { data } = await apiClient.post("/auth/login", {
                email,
                password,
                otp,
            });
            setUser(data);
        }
        catch (error) {
            setError(formatError(error));
            throw error;
        }
    }, []);
    const logout = useCallback(async () => {
        setError(null);
        try {
            await apiClient.post("/auth/logout");
        }
        finally {
            setUser(null);
        }
    }, []);
    const refresh = useCallback(async () => {
        const current = await fetchCurrentUser();
        setUser(current);
    }, []);
    const value = useMemo(() => ({
        user,
        loading,
        error,
        register,
        login,
        logout,
        refresh,
    }), [user, loading, error, register, login, logout, refresh]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
