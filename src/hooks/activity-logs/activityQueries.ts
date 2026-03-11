import { queryOptions } from "@tanstack/react-query";
import { default as activityLogsService } from "./activityService";

const activityLogQueries = {
  all: () =>
    queryOptions({
      queryKey: ["activity-logs"] as const,
      queryFn: activityLogsService.getAll,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: ["activity-logs", id] as const,
      queryFn: () => activityLogsService.getOne(id),
    }),
};

export default activityLogQueries;
