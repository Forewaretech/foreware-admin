import { createResourceApi } from "@/lib/apiClient";
import { z } from "zod";

export enum PlatformEnum {
  google_ads = "google_ads",
  meta_pixel = "meta_pixel",
  google_analytics = "google_analytics",
  linkedin = "linkedin_insight",
}

export enum PlacementEnum {
  header = "header",
  body = "body",
}

export enum TrackingTypeEnum {
  conversion = "conversion",
  page_level = "page_level",
  event = "event",
}

export const trackingSchema = z.object({
  name: z.string().min(1),
  platform: z.nativeEnum(PlatformEnum),
  placement: z.nativeEnum(PlacementEnum),
  type: z.nativeEnum(TrackingTypeEnum),
  codeSnippet: z.string().min(1),
  status: z.enum(["active", "inactive"]).optional(),
});

export type TrackingType = z.infer<typeof trackingSchema> & {
  id?: string;
};

const trackingService = createResourceApi<TrackingType>("tracking-codes");

export default trackingService;
