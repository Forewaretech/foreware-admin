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
import useLeads from "@/hooks/lead/useLeads";
import usePosts from "@/hooks/post/usePosts";
import useMyForms from "@/hooks/form/useForms";
import { FormStatusEnum } from "@/hooks/form/formService";
import useTrackingCodes from "@/hooks/tracking/useTrackingCodes";

export default function Index() {
  const { data: leadData } = useLeads();
  const { data: postData } = usePosts();
  const { data: myFormData } = useMyForms();
  const { data: trackingData } = useTrackingCodes();

  const leads = leadData?.data ?? [];
  const posts = postData?.data ?? [];
  const forms = myFormData?.data ?? [];
  const trackings = trackingData?.data ?? [];

  const activeCodes = trackings.filter(
    (t) => t.status.toLowerCase() === "active",
  );

  const activeForms = forms.filter(
    (f) => f.status.toLowerCase() === FormStatusEnum.active,
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Blog Posts"
          value={posts.length}
          icon={FileText}
          // change="+3 this week"
          positive
        />

        <StatCard
          title="Total Leads"
          value={leads.length}
          icon={Users}
          // change="+12 this week"
          positive
        />

        <StatCard
          title="Active Forms"
          value={activeForms.length}
          icon={FormInput}
        />
        <StatCard
          title="Active Codes"
          value={activeCodes.length}
          icon={Eye}
          // change="+18%"
          positive
        />
        {/* <StatCard
          title="Conversions"
          value="3.1%"
          icon={TrendingUp}
          change="+0.4%"
          positive
        /> */}
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
