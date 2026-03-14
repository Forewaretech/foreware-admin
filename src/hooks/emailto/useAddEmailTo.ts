import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emailtoService } from "./emailToService";
import { emailToQueries } from "./emailToQueries";

const useAddEmailTo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["emailto"],
    mutationFn: emailtoService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: emailToQueries.all().queryKey,
      });
    },
  });
};

export default useAddEmailTo;
