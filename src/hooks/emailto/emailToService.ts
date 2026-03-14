import { createResourceApi } from "@/lib/apiClient";
import z from "zod";

export const emailNotiSchema = z.object({
  email: z.string().email("email is not a valid email"),
  cc: z.string().email("cc is not a valid email").optional(),
});

export type EmailToType = z.infer<typeof emailNotiSchema>;

export const emailtoService = createResourceApi<EmailToType>("emailto");
