import { useMutation, useQueryClient } from "@tanstack/react-query";
import leadService, { UpdateLeadType } from "./leadService";
import leadQueries from "./leadQueries";

interface EditFormVariables {
  id: string;
  data: UpdateLeadType;
}

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: EditFormVariables) => {
      return leadService.update(id, data, {
        path: "status",
      });
    },

    onSuccess: (_, variables) => {
      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: leadQueries.all().queryKey,
      });

      // Optionally update single form cache
      queryClient.invalidateQueries({
        queryKey: leadQueries.detail(variables.id).queryKey,
      });
    },
  });
};
