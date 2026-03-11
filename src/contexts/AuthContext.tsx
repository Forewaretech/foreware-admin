import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import authService, { AuthType } from "@/hooks/auth/authService";
import { AxiosError } from "axios";
import { toast } from "sonner";

export type UserRole = "super_admin" | "admin" | "user";

interface AuthContextType {
  currentUser: AuthType | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthType | null>(null);

  // ----------------------------------------
  // LOAD USER FROM COOKIE ON PAGE REFRESH
  // ----------------------------------------
  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.getOne("me"); // GET /auth/me
      setCurrentUser(me);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ----------------------------------------
  // LOGIN
  // ----------------------------------------
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        // Calls your backend: POST /auth/login
        const res = await authService.create(
          { email, password },
          { path: "login" },
        );

        if (!res) {
          toast.error("Login failed");
          return false;
        }

        // Backend should set httpOnly cookies here
        await refreshUser();
        return true;
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data?.message || "Login failed");
        }
        return false;
      }
    },
    [refreshUser],
  );

  // ----------------------------------------
  // LOGOUT
  // ----------------------------------------
  const logout = useCallback(async () => {
    try {
      await authService.create({}, { path: "logout" }); // backend clears cookies
    } catch {
      // ignore
    }
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
