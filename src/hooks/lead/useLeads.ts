import { useQuery } from "@tanstack/react-query";
import leadQueries from "./leadQueries";

const useLeads = () => useQuery(leadQueries.all());

export default useLeads;
