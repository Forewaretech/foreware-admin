import { createResourceApi } from "@/lib/apiClient";
import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  content: z.string().min(1, "Content is required"),
  seoTitle: z.string().max(60, "Max 60 characters").optional(),
  seoDescription: z.string().max(160, "Max 160 characters").optional(),
  featuredImage: z.string().optional(),
  featuredImageTitle: z.string().optional(),
  featuredImageCaption: z.string().optional(),
});

export type BlogPostType = z.infer<typeof postSchema> & {
  userId: string;
  createdAt: string;
  updatedAt: string;
  id: string;
};

const postService = createResourceApi<BlogPostType>("posts");

export default postService;
