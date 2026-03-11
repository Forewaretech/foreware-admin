import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const roleBadge: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  user: "User",
};

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");

  if (!currentUser) return null;

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    // updateProfile({ name: name.trim(), email: email.trim() });
    toast.success("Profile updated");
  };

  console.log("currentUser: ", currentUser);
  // return <div>LOve</div>;
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-card rounded-lg border p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-2xl font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {currentUser.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {currentUser.email}
              </span>
              <Badge variant="secondary">
                {roleBadge[currentUser.role.toLowerCase()]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input
              value={roleBadge[currentUser.role.toLowerCase()]}
              disabled
              className="bg-muted"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
