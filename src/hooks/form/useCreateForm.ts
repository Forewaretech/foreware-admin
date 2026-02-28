import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formQueries } from "./formQueries";
import formService from "./formService";

// CREATE (CRUD example)
export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formService.create,
    onSuccess: () => {
      // Reusability: Use the key directly from the factory!
      queryClient.invalidateQueries({ queryKey: formQueries.all().queryKey });
    },
  });
};
