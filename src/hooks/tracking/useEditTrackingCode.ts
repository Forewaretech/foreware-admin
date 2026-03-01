import { useMutation, useQueryClient } from "@tanstack/react-query";
import trackingService, { TrackingType } from "./trackingService";
import trackingQueries from "./trackingQueries";

interface EditFormVariables {
  id: string;
  data: TrackingType;
}

export const useEditTrackingCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: EditFormVariables) =>
      trackingService.update(id, data),

    onSuccess: (_, variables) => {
      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: trackingQueries.all().queryKey,
      });

      // Optionally update single form cache
      queryClient.invalidateQueries({
        queryKey: trackingQueries.detail(variables.id).queryKey,
      });
    },
  });
};
