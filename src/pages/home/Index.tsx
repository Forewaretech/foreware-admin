import {
  FileText,
  File,
  Users,
  FormInput,
  Eye,
  TrendingUp,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { Link } from "react-router-dom";
import RecentActivity from "./RecentActivity";

export default function Index() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Blog Posts"
          value={24}
          icon={FileText}
          change="+3 this week"
          positive
        />

        <StatCard
          title="Total Leads"
          value={187}
          icon={Users}
          change="+12 this week"
          positive
        />
        <StatCard title="Active Forms" value={8} icon={FormInput} />
        <StatCard
          title="Page Views"
          value="4.2K"
          icon={Eye}
          change="+18%"
          positive
        />
        <StatCard
          title="Conversions"
          value="3.1%"
          icon={TrendingUp}
          change="+0.4%"
          positive
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity />

        {/* Quick Actions */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              { label: "New Blog Post", icon: FileText, path: "/blog" },
              { label: "Create Page", icon: File, path: "/pages" },
              { label: "Add Form", icon: FormInput, path: "/forms" },
              { label: "View Leads", icon: Users, path: "/leads" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary transition-colors"
              >
                <action.icon className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
