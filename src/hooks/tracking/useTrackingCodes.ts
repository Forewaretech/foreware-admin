import { useQuery } from "@tanstack/react-query";
import trackingQueries from "./trackingQueries";

const useTrackingCodes = () => {
  return useQuery(trackingQueries.all());
};

export default useTrackingCodes;
