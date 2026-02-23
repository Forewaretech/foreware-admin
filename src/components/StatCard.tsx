import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  positive?: boolean;
}

export default function StatCard({ title, value, icon: Icon, change, positive }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
          {change && (
            <p className={`text-xs mt-1 font-medium ${positive ? "text-success" : "text-destructive"}`}>
              {change}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
      </div>
    </div>
  );
}
