import { queryOptions } from "@tanstack/react-query";
import postService from "./postService";

export const postQueries = {
  all: () =>
    queryOptions({
      queryKey: ["posts"] as const,
      queryFn: postService.getAll,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ["posts", id] as const,
      queryFn: () => postService.getOne(id),
    }),
};
