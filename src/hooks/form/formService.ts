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

// [
//         "displayBehavior": "ONCE_PER_BROWSER",
//         "closeBehavior": "HIDE_FOR_24H",
//         "userId": null,
//         "createdAt": "2026-03-13T21:00:51.300Z",
//         "updatedAt": "2026-03-13T21:00:51.300Z",
//         "fields": [
//             {
//                 "id": "8caa0ade-74e1-4792-8e7d-99e4430a8999",
//                 "formId": "f9c79f53-7919-42da-a9bd-28f35618089f",
//                 "label": "Gender",
//                 "type": "SELECT",
//                 "required": true,
//                 "options": [
//                     "Male",
//                     "Female"
//                 ],
//                 "createdAt": "2026-03-13T21:00:51.300Z"
//             }
//         ]
//     }
// ]

export const createFormSchema = z.object({
  name: z.string().min(1),
  triggerType: z.nativeEnum(TriggerEnum),
  bannerImage: z.string().url().optional(),
  thankYouMessage: z.string().optional(),
  status: z.nativeEnum(FormStatusEnum).optional(),
  targetEmails: z.array(z.string().email()).min(1),
  assignedPages: z.array(z.string()).optional(),
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

export type FormType = z.infer<typeof createFormSchema> & {
  id: string;
  status: FormStatusEnum;
};

export type FormUpdateType = z.infer<typeof updateFormSchema>;
export type FormField = z.infer<typeof formFieldSchema>;

const formService = createResourceApi<FormType>("forms");

export default formService;
