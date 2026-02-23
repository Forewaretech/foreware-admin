import { useState } from "react";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Shield, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<UserRole, string> = { super_admin: "Super Admin", admin: "Admin", user: "User" };
const roleIcons: Record<UserRole, typeof Shield> = { super_admin: ShieldCheck, admin: Shield, user: User };

export default function UsersPage() {
  const { currentUser, users, addUser, deleteUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");

  const isSuperAdmin = currentUser?.role === "super_admin";

  const handleAdd = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("All fields are required");
      return;
    }
    const ok = addUser({ name: name.trim(), email: email.trim(), role }, password);
    if (ok) {
      toast.success("User created");
      setName(""); setEmail(""); setPassword(""); setRole("user");
      setOpen(false);
    } else {
      toast.error("Email already exists");
    }
  };

  const handleDelete = (id: string) => {
    if (deleteUser(id)) toast.success("User removed");
    else toast.error("Cannot delete this user");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Users & Roles</h2>
        {isSuperAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Add User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2"><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full">Create User</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              {isSuperAdmin && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const RoleIcon = roleIcons[u.role];
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <RoleIcon className="w-3 h-3" />
                      {roleLabels[u.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      {u.role !== "super_admin" && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
