import { queryOptions } from "@tanstack/react-query";
import formService from "./formService";

export const formQueries = {
  all: () =>
    queryOptions({
      queryKey: ["forms"] as const,
      queryFn: formService.getAll,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ["forms", id] as const,
      queryFn: () => formService.getOne(id),
    }),
};
