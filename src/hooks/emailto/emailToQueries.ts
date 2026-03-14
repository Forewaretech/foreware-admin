import { queryOptions } from "@tanstack/react-query";
import { emailtoService } from "./emailToService";

export const emailToQueries = {
  all: () =>
    queryOptions({
      queryKey: ["emailto"],
      queryFn: emailtoService.getAll,
    }),
};
