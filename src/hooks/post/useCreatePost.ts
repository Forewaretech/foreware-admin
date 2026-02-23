import { useMutation, useQueryClient } from "@tanstack/react-query";
import postsApi from "./postService";
import { postQueries } from "./postQueries";

// CREATE (CRUD example)
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      // Reusability: Use the key directly from the factory!
      queryClient.invalidateQueries({ queryKey: postQueries.all().queryKey });
    },
  });
};
