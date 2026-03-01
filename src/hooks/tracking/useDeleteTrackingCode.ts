// useDeleteTrackingCode.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import trackingService from "./trackingService";
import trackingQueries from "./trackingQueries";

export const useDeleteTrackingCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trackingService.delete(id),

    onSuccess: (_, deletedId) => {
      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: trackingQueries.all().queryKey,
      });

      // Remove detail cache if exists
      queryClient.removeQueries({
        queryKey: trackingQueries.detail(deletedId).queryKey,
      });
    },
  });
};
