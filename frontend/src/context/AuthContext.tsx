import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiClient, formatError, getCsrfToken } from "../lib/apiClient";
import { AuthUser } from "../lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  register: (params: RegisterPayload) => Promise<void>;
  login: (params: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface RegisterPayload {
  email: string;
  password: string;
  roles: string[];
}

interface LoginPayload {
  email: string;
  password: string;
  otp?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await apiClient.get<AuthUser>("/me", {
      headers: { "cache-control": "no-cache" },
    });
    return data;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      await getCsrfToken().catch(() => null);
      const current = await fetchCurrentUser();
      setUser(current);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const register = useCallback(
    async ({ email, password, roles }: RegisterPayload) => {
      setError(null);
      try {
        await apiClient.post("/auth/register", {
          email,
          password,
          roles,
        });
        // automatically login after successful registration
        const { data } = await apiClient.post<AuthUser>("/auth/login", {
          email,
          password,
        });
        setUser(data);
      } catch (error) {
        setError(formatError(error));
        throw error;
      }
    },
    [],
  );

  const login = useCallback(async ({ email, password, otp }: LoginPayload) => {
    setError(null);
    try {
      const { data } = await apiClient.post<AuthUser>("/auth/login", {
        email,
        password,
        otp,
      });
      setUser(data);
    } catch (error) {
      setError(formatError(error));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await apiClient.post("/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    const current = await fetchCurrentUser();
    setUser(current);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      register,
      login,
      logout,
      refresh,
    }),
    [user, loading, error, register, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
