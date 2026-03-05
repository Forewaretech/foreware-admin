import { createResourceApi } from "@/lib/apiClient";
import z from "zod";

const leadSchema = z.object({
  data: z.record(z.string()),
  form_name: z.string(),
  page_url: z.string(),
  status: z.string(),
  created_at: z.string(),
});

export type LeadType = z.infer<typeof leadSchema> & {
  id?: string;
  name?: string;
  email?: string;
  source?: string;
  submissions?: any[];
};

export const updateLeadSchema = leadSchema.partial().extend({
  status: z.string().optional(),
});

const leadService = createResourceApi<LeadType>("leads");
export type UpdateLeadType = z.infer<typeof updateLeadSchema>;

export default leadService;
