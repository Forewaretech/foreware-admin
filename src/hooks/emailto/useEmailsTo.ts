import { useQuery } from "@tanstack/react-query";
import { emailToQueries } from "./emailToQueries";

const useEmailsTo = () => useQuery(emailToQueries.all());

export default useEmailsTo;
