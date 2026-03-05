import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Download, Eye, Mail, Search } from "lucide-react";
import { useState } from "react";

import { LeadType } from "@/hooks/lead/leadService";
import { toast } from "sonner";
import useLeads from "@/hooks/lead/useLeads";
import { useUpdateLead } from "@/hooks/lead/useUpdateLead";

const statusColors: Record<string, string> = {
  new: "bg-accent/10 text-accent",
  contacted: "bg-warning/10 text-warning",
  qualified: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
};

export default function Leads() {
  const { data: leadData } = useLeads();
  const { mutate: mutateLead } = useUpdateLead();

  const [search, setSearch] = useState("");
  // const [selected, setSelected] = useState<LeadType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const leads: LeadType[] =
    leadData?.data?.map((lead) => {
      const latestSubmission = lead.submissions?.[0];

      return {
        id: lead.id,
        data: latestSubmission?.data || {
          Name: lead.name,
          Email: lead.email,
        },
        form_name: lead.source || "Unknown",
        page_url: latestSubmission?.form?.assignedPages?.[0] || "",
        status: lead.status.toLowerCase(), // important
        created_at: new Date().toISOString(), // use backend createdAt if available
      };
    }) || [];

  const filtered = leads.filter((l) => {
    const str =
      JSON.stringify(l.data).toLowerCase() + l.form_name.toLowerCase();
    return str.includes(search.toLowerCase());
  });

  const selected = leads.find((l) => l.id === selectedId) || null;

  const updateStatus = (id: string, status: string) => {
    mutateLead(
      { id, data: { status } },
      {
        onSuccess() {
          toast.success("Status updated");
        },
        onError(error) {
          toast.error(`Failed to Update Status: ${error.message}`);
        },
      },
    );
  };

  const exportCSV = () => {
    const allKeys = [...new Set(leads.flatMap((l) => Object.keys(l.data)))];
    const header = ["Form", "Status", "Date", ...allKeys].join(",");
    const rows = leads.map((l) =>
      [
        l.form_name,
        l.status,
        new Date(l.created_at).toLocaleDateString(),
        ...allKeys.map((k) => l.data[k] || ""),
      ].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const getName = (data: Record<string, string>) =>
    data.Name || data.name || data.Email || data.email || "-";
  const getEmail = (data: Record<string, string>) =>
    data.Email || data.email || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Dialog
        open={!!selectedId}
        onOpenChange={(o) => !o && setSelectedId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selected.data).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground">{key}</p>
                    <p className="font-medium text-foreground">{value}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="font-medium text-foreground">
                    {selected.form_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {new Date(selected.created_at).toLocaleDateString()}
                  </p>
                </div>
                {selected.page_url && (
                  <div>
                    <p className="text-xs text-muted-foreground">Page</p>
                    <p className="font-medium text-foreground">
                      {selected.page_url}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                {(["new", "contacted", "qualified", "closed"] as const).map(
                  (s) => (
                    <Button
                      key={s}
                      variant={selected.status === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(selected.id, s.toUpperCase())}
                      className={
                        selected.status === s
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  ),
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary">
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Name
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">
                  Email
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                  Source
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                  Date
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b last:border-0 hover:bg-secondary/50 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-medium text-foreground">
                      {getName(lead.data)}
                    </p>
                    <p className="text-xs text-muted-foreground sm:hidden">
                      {getEmail(lead.data)}
                    </p>
                  </td>
                  <td className="p-4 text-muted-foreground hidden sm:table-cell">
                    {getEmail(lead.data)}
                  </td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">
                    {lead.form_name}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="secondary"
                      className={statusColors[lead.status] || ""}
                    >
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedId(lead.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {getEmail(lead.data) && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`mailto:${getEmail(lead.data)}`}>
                            <Mail className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
