import authService, { AuthType } from "@/hooks/auth/authService";
import { AxiosError } from "axios";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { toast } from "sonner";

export type UserRole = "super_admin" | "admin" | "user";

interface AuthContextType {
  currentUser: AuthType | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthType | null>(null);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const found = await authService.create(
          { email, password },
          { path: "login" },
        );

        if (found) {
          const { password: _, ...user } = found;
          const me = await authService.getOne("me");

          setCurrentUser(found);
          return true;
        }
        return false;
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.message || "Login failed");
        }
      }
    },
    [currentUser],
  );

  const logout = useCallback(() => setCurrentUser(null), []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
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
