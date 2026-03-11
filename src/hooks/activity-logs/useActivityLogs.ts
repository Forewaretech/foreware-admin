import { useQuery } from "@tanstack/react-query";
import activityLogQueries from "./activityQueries";

const useActivityLogs = () => useQuery(activityLogQueries.all());

export default useActivityLogs;
