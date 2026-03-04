import {
  FileText,
  File,
  Users,
  FormInput,
  Eye,
  TrendingUp,
} from "lucide-react";
import StatCard from "@/components/StatCard";

const recentActivity = [
  {
    action: "New lead submitted",
    detail: "Contact form - john@acme.com",
    time: "2 min ago",
  },
  {
    action: "Blog post published",
    detail: "Fleet Compliance Guide 2026",
    time: "1 hour ago",
  },
  {
    action: "Landing page created",
    detail: "Google Ads - Fleet Demo",
    time: "3 hours ago",
  },
  {
    action: "Pop-up enabled",
    detail: "Newsletter signup on /blog",
    time: "5 hours ago",
  },
  {
    action: "Tracking code added",
    detail: "LinkedIn Insight Tag",
    time: "Yesterday",
  },
];

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
        {/* Recent Activity */}
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
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

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
              <a
                key={action.label}
                href={action.path}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary transition-colors"
              >
                <action.icon className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
