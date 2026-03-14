import useActivityLogs from "@/hooks/activity-logs/useActivityLogs";
import { formatDistanceToNow } from "date-fns";

const RecentActivity = () => {
  const { data: activityData } = useActivityLogs();

  const recentActivity = activityData?.data ?? [];

  return (
    <div className="lg:col-span-2 bg-card rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {recentActivity.map((item, i) => (
          <div
            key={i}
            className="flex items-start justify-between py-2 border-b last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {item.action}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.detail}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
              {formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
