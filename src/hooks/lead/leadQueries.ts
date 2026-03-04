import { queryOptions } from "@tanstack/react-query";
import leadService from "./leadService";

const leadQueries = {
  all: () =>
    queryOptions({
      queryKey: ["leads"] as const,
      queryFn: leadService.getAll,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: ["leads", id] as const,
      queryFn: () => leadService.getOne(id),
    }),
};

export default leadQueries;
