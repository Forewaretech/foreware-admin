// form.validation.ts
import { createResourceApi } from "@/lib/apiClient";
import { z } from "zod";

export enum FormFieldEnum {
  TEXT = "text",
  EMAIL = "email",
  TEXTAREA = "textarea",
  NUMBER = "number",
  SELECT = "select",
  PHONE = "phone",
  CHECKBOX = "checkbox",
}

export enum TriggerEnum {
  embed = "embed",
  popup_load = "popup_load",
  popup_scroll = "popup_scroll",
  popup_time = "popup_time",
}

export enum FormStatusEnum {
  active = "active",
  inactive = "inactive",
}

export enum FieldsEnum {
  text = "text",
  email = "email",
  textarea = "textarea",
  number = "number",
  select = "select",
  checkbox = "checkbox",
}

export const formFieldSchema = z.object({
  label: z.string().min(1),
  name: z.string().min(1),
  type: z.nativeEnum(FormFieldEnum),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(),

  // placeholder: z.string().optional(),
});

export const createFormSchema = z.object({
  name: z.string().min(1),
  trigger_type: z.nativeEnum(TriggerEnum),
  banner_image: z.string().url().optional(),
  thank_you_message: z.string().optional(),
  status: z.nativeEnum(FormStatusEnum).optional(),

  target_emails: z.array(z.string().email()).min(1),
  assigned_pages: z.array(z.string()).optional(),

  fields: z.array(formFieldSchema).min(1),
});

export const updateFormSchema = createFormSchema.partial().extend({
  fields: z
    .array(
      formFieldSchema.extend({
        id: z.string().optional(), // important for existing fields
      }),
    )
    .optional(),
});

export type FormType = z.infer<typeof createFormSchema>;
export type FormUpdateType = z.infer<typeof updateFormSchema>;
export type FormField = z.infer<typeof formFieldSchema>;

const formService = createResourceApi<FormType>("forms");

export default formService;
