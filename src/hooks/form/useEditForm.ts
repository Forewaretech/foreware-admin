import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formQueries } from "./formQueries";
import formService, { FormUpdateType } from "./formService";

interface EditFormVariables {
  id: string;
  data: FormUpdateType;
}

export const useEditForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: EditFormVariables) =>
      formService.update(id, data),

    onSuccess: (_, variables) => {
      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: formQueries.all().queryKey,
      });

      // Optionally update single form cache
      queryClient.invalidateQueries({
        queryKey: formQueries.detail(variables.id).queryKey,
      });
    },
  });
};
