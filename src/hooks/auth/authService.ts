import { UserRole } from "@/contexts/AuthContext";
import { createResourceApi } from "@/lib/apiClient";
import { z } from "zod";

export const authSchema = z.object({
  email: z.string().min(1, "Email is required").email("Email is not valid"),
  password: z.string().min(1, "Password is required"),
});

export type AuthType = z.infer<typeof authSchema> & {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
};

const authService = createResourceApi<AuthType>("auth");

export default authService;
