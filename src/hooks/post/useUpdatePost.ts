import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postQueries } from "./postQueries.js";
import { toast } from "sonner";
import postService, { BlogPostType } from "./postService.js";

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const queryKey = postQueries.all().queryKey;

  return useMutation({
    // mutationFn expects an object with id and the new data
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogPostType> }) =>
      postService.update(id, data),

    onMutate: async ({ id, data }) => {
      // 1. Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot the current cache
      const previousPosts = queryClient.getQueryData<BlogPostType[]>(queryKey);

      // 3. Optimistically update the specific post in the array
      queryClient.setQueryData<BlogPostType[]>(queryKey, (old) =>
        old?.data?.map((post) =>
          post.id === id ? { ...post, ...data } : post,
        ),
      );

      // 4. Return context for rollback
      return { previousPosts };
    },

    onError: (err, variables, context) => {
      // 5. Rollback if things go south
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKey, context.previousPosts);
      }
      toast.error("Update failed. Reverting changes...");
    },

    onSettled: (data, error, variables) => {
      // 6. Sync with server (invalidates both list and specific detail)
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({
        queryKey: postQueries.detail(variables.id).queryKey,
      });
    },
  });
};
