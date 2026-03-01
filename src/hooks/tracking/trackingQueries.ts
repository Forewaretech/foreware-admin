import { queryOptions } from "@tanstack/react-query";
import trackingService from "./trackingService";

const trackingQueries = {
  all: () =>
    queryOptions({
      queryKey: ["tracking"] as const,
      queryFn: trackingService.getAll,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ["tracking", id] as const,
      queryFn: () => trackingService.getOne(id),
    }),
};

export default trackingQueries;
