// form.validation.ts
import { createResourceApi } from "@/lib/apiClient";
import { z } from "zod";

export enum FormFieldEnum {
  TEXT,
  EMAIL,
  TEXTAREA,
  NUMBER,
  SELECT,
  CHECKBOX,
}

export enum TriggerEnum {
  embed = "embed",
  popup = "popup",
}

export enum FormStatusEnum {
  active = "active",
  inactive = "inactive",
}

export const formFieldSchema = z.object({
  label: z.string().min(1),
  name: z.string().min(1),
  type: z.nativeEnum(FormFieldEnum),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
});

export const createFormSchema = z.object({
  name: z.string().min(1),
  trigger_type: z.nativeEnum(TriggerEnum),
  banner_image: z.string().url().optional(),
  thank_you_message: z.string().optional(),
  status: z.nativeEnum(FormStatusEnum).optional(),

  target_emails: z.array(z.string().email()).min(1),
  assigned_pages: z.array(z.string()).optional(),

  fields: z
    .array(
      z.object({
        label: z.string(),
        type: z.enum([
          "text",
          "email",
          "textarea",
          "number",
          "select",
          "checkbox",
        ]),
        required: z.boolean().optional(),
      }),
    )
    .min(1),
});

export type FormType = z.infer<typeof createFormSchema>;

const formService = createResourceApi<FormType>("forms");

export default formService;
