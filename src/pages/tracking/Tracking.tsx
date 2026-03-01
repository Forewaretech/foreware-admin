import { useState } from "react";
import { Plus, Search, Trash2, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import useCreateTrackingCode from "@/hooks/tracking/useCreateTrackingCode";
import { AxiosError } from "axios";
import {
  PlacementEnum,
  PlatformEnum,
  TrackingTypeEnum,
} from "@/hooks/tracking/trackingService";
import useTrackingCodes from "@/hooks/tracking/useTrackingCodes";
import { useEditTrackingCode } from "@/hooks/tracking/useEditTrackingCode";
import { useDeleteTrackingCode } from "@/hooks/tracking/useDeleteTrackingCode";

interface TrackingCode {
  id: string;
  name: string;
  platform: string;
  placement: string;
  type: string;
  status: string;
  snippet: string;
}

const PLATFORMS = [
  { value: "google_ads", label: "Google Ads" },
  { value: "meta_pixel", label: "Meta Pixel" },
  { value: "google_analytics", label: "Google Analytics" },
  { value: "linkedin_insight", label: "LinkedIn Insight Tag" },
];

const initialCodes: TrackingCode[] = [
  {
    id: "1",
    name: "Google Analytics",
    platform: "google_analytics",
    placement: "header",
    type: "page",
    status: "active",
    snippet: "<!-- GA snippet -->",
  },
  {
    id: "2",
    name: "Meta Pixel",
    platform: "meta_pixel",
    placement: "header",
    type: "conversion",
    status: "active",
    snippet: "<!-- Meta pixel -->",
  },
];

export default function Tracking() {
  const [codes, setCodes] = useState<TrackingCode[]>(initialCodes);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    platform: "",
    placement: "header",
    type: "page",
    snippet: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: mutateTrackingCode, isPending: isPendingTrackingCode } =
    useCreateTrackingCode();
  const { data: trackingCodeData } = useTrackingCodes();
  const { mutate: editTrackingCode } = useEditTrackingCode();
  const { mutate: deleteTrackingCode } = useDeleteTrackingCode();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.platform) e.platform = "Platform is required";
    if (!form.snippet.trim()) e.snippet = "Snippet is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const data = {
      name: form.name,
      placement: form.placement as PlacementEnum,
      platform: form.platform as PlatformEnum,
      type: form.type as TrackingTypeEnum,
      codeSnippet: form.snippet,
    };

    mutateTrackingCode(data, {
      onSuccess: () => {
        toast.success("Tracking code added - ready for submission");
        setDialogOpen(false);
        setForm({
          name: "",
          platform: "",
          placement: "header",
          type: "page",
          snippet: "",
        });
        setErrors({});
      },
      onError(error, variables, context) {
        if (error instanceof AxiosError) {
          console.log(error.response.data);
        }
      },
    });
  };

  const getPlatformLabel = (value: string) =>
    PLATFORMS.find((p) => p.value === value)?.label || value;

  const trackingCodes = trackingCodeData ? trackingCodeData.data : [];

  const filtered = trackingCodes
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .map((code) => ({
      id: code.id,
      name: code.name,
      platform: code.platform.toLowerCase(),
      placement: code.placement.toLowerCase(),
      type: code.type.toLowerCase(),
      status: code.status.toLowerCase(),
      snippet: code.codeSnippet,
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tracking codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Tracking Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tracking Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Google Ads Conversion"
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label>Platform *</Label>
                <Select
                  value={form.platform}
                  onValueChange={(v) => setForm({ ...form, platform: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.platform && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.platform}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Placement</Label>
                  <Select
                    value={form.placement}
                    onValueChange={(v) => setForm({ ...form, placement: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="body">Body</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversion">Conversion</SelectItem>
                      <SelectItem value="page">Page-level</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Code Snippet *</Label>
                <Textarea
                  value={form.snippet}
                  onChange={(e) =>
                    setForm({ ...form, snippet: e.target.value })
                  }
                  placeholder="Paste tracking code here..."
                  rows={5}
                  className="font-mono text-xs"
                />
                {errors.snippet && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.snippet}
                  </p>
                )}
              </div>
              <Button
                disabled={isPendingTrackingCode}
                onClick={handleSave}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isPendingTrackingCode ? "Loading..." : "Add Code"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary">
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Name
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">
                  Platform
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                  Placement
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Active
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((code) => (
                <tr
                  key={code.id}
                  className="border-b last:border-0 hover:bg-secondary/50 transition-colors"
                >
                  <td className="p-4 font-medium text-foreground flex items-center gap-2">
                    <Code className="w-4 h-4 text-accent shrink-0" />
                    {code.name}
                  </td>
                  <td className="p-4 text-muted-foreground hidden sm:table-cell">
                    {getPlatformLabel(code.platform)}
                  </td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell capitalize">
                    {code.placement.replace("_", " ")}
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary">{code.type}</Badge>
                  </td>
                  <td className="p-4">
                    <Switch
                      checked={code.status === "active"}
                      onCheckedChange={() => {
                        editTrackingCode(
                          {
                            id: code.id,
                            data: {
                              status:
                                code.status === "active"
                                  ? "inactive"
                                  : "active",
                            },
                          },
                          {
                            onError(error, variables, context) {
                              if (error instanceof AxiosError) {
                                console.log(error.response.data);
                              }
                            },
                          },
                        );
                      }}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          deleteTrackingCode(code.id, {
                            onSuccess(data, variables, context) {
                              toast.success("Tracking code removed");
                            },
                          });
                          // setCodes(codes.filter((c) => c.id !== code.id));
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
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
                    No tracking codes found.
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
