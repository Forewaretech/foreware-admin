import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
        <div className="space-y-3">
          <div><Label>Site Name</Label><Input defaultValue="Foreware" /></div>
          <div><Label>Admin Email</Label><Input defaultValue="info@foreware.io" /></div>
          <div><Label>Site URL</Label><Input defaultValue="https://foreware-mauve.vercel.app" /></div>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Email Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Configure where form submissions are sent. Individual form emails can be set in the Forms & Pop-ups section.
        </p>
        <div className="space-y-3">
          <div><Label>Default Notification Email</Label><Input defaultValue="info@foreware.io" /></div>
          <div><Label>CC Email (optional)</Label><Input placeholder="cc@foreware.io" /></div>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
      </div>
    </div>
  );
}
