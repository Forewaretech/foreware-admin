import { createResourceApi } from "@/lib/apiClient";

type ActivityLog = {
  id: string;
  action: string;
  detail: string;
  metadata: Record<string, string>;
  userId: string;
  createdAt: string;
};

const activityLogsService = createResourceApi<ActivityLog>("activity-logs");

export default activityLogsService;
