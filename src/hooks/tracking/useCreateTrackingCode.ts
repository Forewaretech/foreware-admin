import { QueryClient, useMutation } from "@tanstack/react-query";
import trackingQueries from "./trackingQueries";
import trackingService from "./trackingService";

const useCreateTrackingCode = () => {
  const queryClient = new QueryClient();

  return useMutation({
    mutationFn: trackingService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackingQueries.all().queryKey,
      });
    },
  });
};

export default useCreateTrackingCode;
