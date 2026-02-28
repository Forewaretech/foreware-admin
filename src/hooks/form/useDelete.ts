// useDeleteForm.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formQueries } from "./formQueries";
import formService from "./formService";

export const useDeleteForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formService.delete(id),

    onSuccess: (_, deletedId) => {
      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: formQueries.all().queryKey,
      });

      // Remove detail cache if exists
      queryClient.removeQueries({
        queryKey: formQueries.detail(deletedId).queryKey,
      });
    },
  });
};
