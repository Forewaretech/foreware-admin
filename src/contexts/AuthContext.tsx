import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "super_admin" | "admin" | "user";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: AppUser | null;
  users: AppUser[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<AppUser, "id" | "createdAt">, password: string) => boolean;
  deleteUser: (id: string) => boolean;
  updateProfile: (data: Partial<Pick<AppUser, "name" | "email" | "avatar">>) => void;
}

const DEFAULT_USERS: (AppUser & { password: string })[] = [
  {
    id: "1",
    email: "admin@foreware.io",
    name: "Super Admin",
    role: "super_admin",
    createdAt: new Date().toISOString(),
    password: "admin123",
  },
];

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usersWithPw, setUsersWithPw] = useState(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const users = usersWithPw.map(({ password, ...u }) => u);

  const login = useCallback(
    (email: string, password: string) => {
      const found = usersWithPw.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (found) {
        const { password: _, ...user } = found;
        setCurrentUser(user);
        return true;
      }
      return false;
    },
    [usersWithPw]
  );

  const logout = useCallback(() => setCurrentUser(null), []);

  const addUser = useCallback(
    (user: Omit<AppUser, "id" | "createdAt">, password: string) => {
      if (usersWithPw.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) return false;
      setUsersWithPw((prev) => [
        ...prev,
        { ...user, id: crypto.randomUUID(), createdAt: new Date().toISOString(), password },
      ]);
      return true;
    },
    [usersWithPw]
  );

  const deleteUser = useCallback(
    (id: string) => {
      if (id === "1") return false; // can't delete super admin
      setUsersWithPw((prev) => prev.filter((u) => u.id !== id));
      return true;
    },
    []
  );

  const updateProfile = useCallback(
    (data: Partial<Pick<AppUser, "name" | "email" | "avatar">>) => {
      if (!currentUser) return;
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : prev));
      setUsersWithPw((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, ...data } : u))
      );
    },
    [currentUser]
  );

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, addUser, deleteUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
