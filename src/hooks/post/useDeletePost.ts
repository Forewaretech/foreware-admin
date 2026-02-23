import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postQueries } from "./postQueries.js";
import { toast } from "sonner";
import postService, { BlogPostType } from "./postService.js";

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const queryKey = postQueries.all().queryKey;

  return useMutation({
    mutationFn: (id: string) => postService.delete(id),

    // Step 1: When mutate is called
    onMutate: async (id) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<BlogPostType[]>(queryKey);

      // Optimistically update to the new value (remove the post)
      queryClient.setQueryData<BlogPostType[]>(queryKey, (old) =>
        old?.filter((post) => post.id !== id),
      );

      // Return a context object with the snapshotted value
      return { previousPosts };
    },

    // Step 2: If the mutation fails
    onError: (err, id, context) => {
      // Rollback to the previous state using the context
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKey, context.previousPosts);
      }
      toast.error("Failed to delete post. Reverting...");
    },

    // Step 3: Always refetch after error or success to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
