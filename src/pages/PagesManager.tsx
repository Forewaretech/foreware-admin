import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/RichTextEditor";
import { toast } from "sonner";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: string;
  status: string;
  seo_title: string;
  seo_description: string;
  banner_image: string;
  created_at: string;
}

const initialPages: Page[] = [
  {
    id: "1",
    title: "Home",
    slug: "/",
    content: "<p>Welcome to Foreware.</p>",
    type: "page",
    status: "published",
    seo_title: "Foreware - Fleet Management",
    seo_description: "Leading fleet management solutions.",
    banner_image: "",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Fleet Demo Landing",
    slug: "/fleet-demo",
    content: "<p>Request a demo today.</p>",
    type: "landing",
    status: "draft",
    seo_title: "",
    seo_description: "",
    banner_image: "",
    created_at: new Date().toISOString(),
  },
];

export default function PagesManager() {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState<Page | null>(null);
  const [editing, setEditing] = useState<Page | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    type: "page",
    status: "draft",
    content: "",
    seo_title: "",
    seo_description: "",
    banner_image: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const slug =
      form.slug ||
      "/" +
        form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
    if (editing) {
      setPages(
        pages.map((p) => (p.id === editing.id ? { ...p, ...form, slug } : p)),
      );
      toast.success("Page updated - ready for submission");
    } else {
      setPages([
        {
          ...form,
          id: crypto.randomUUID(),
          slug,
          created_at: new Date().toISOString(),
        },
        ...pages,
      ]);
      toast.success("Page created - ready for submission");
    }
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      title: "",
      slug: "",
      type: "page",
      status: "draft",
      content: "",
      seo_title: "",
      seo_description: "",
      banner_image: "",
    });
    setErrors({});
  };

  const handleBannerSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setForm((f) => ({ ...f, banner_image: url }));
      toast.success("Banner image selected");
    };
    input.click();
  };

  const filtered = pages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Page" : "New Page"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Page title"
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.title}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="/page-url"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="landing">Landing Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Banner Image */}
              <div>
                <Label>Banner Image</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={form.banner_image}
                    onChange={(e) =>
                      setForm({ ...form, banner_image: e.target.value })
                    }
                    placeholder="Banner image URL or upload"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleBannerSelect}
                    title="Upload banner"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  {form.banner_image && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setForm({ ...form, banner_image: "" })}
                      title="Remove banner"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {form.banner_image && (
                  <img
                    src={form.banner_image}
                    alt="Banner preview"
                    className="w-full max-h-40 object-cover rounded-lg mt-2"
                  />
                )}
              </div>

              <div>
                <Label>Content</Label>
                <RichTextEditor
                  content={form.content}
                  onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                  placeholder="Write page content..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SEO Title</Label>
                  <Input
                    value={form.seo_title}
                    onChange={(e) =>
                      setForm({ ...form, seo_title: e.target.value })
                    }
                    placeholder="SEO title"
                    maxLength={60}
                  />
                </div>
                <div>
                  <Label>SEO Description</Label>
                  <Input
                    value={form.seo_description}
                    onChange={(e) =>
                      setForm({ ...form, seo_description: e.target.value })
                    }
                    placeholder="SEO description"
                    maxLength={160}
                  />
                </div>
              </div>
              <Button
                onClick={handleSave}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview Modal */}
      <Dialog
        open={!!previewPage}
        onOpenChange={(o) => {
          if (!o) setPreviewPage(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {previewPage?.title}</DialogTitle>
          </DialogHeader>
          {previewPage && (
            <div className="mt-2">
              {previewPage.banner_image && (
                <img
                  src={previewPage.banner_image}
                  alt="Banner"
                  className="w-full max-h-56 object-cover rounded-lg mb-4"
                />
              )}
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: previewPage.content }}
              />
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
                  Title
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">
                  Slug
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((page) => (
                <tr
                  key={page.id}
                  className="border-b last:border-0 hover:bg-secondary/50 transition-colors"
                >
                  <td className="p-4 font-medium text-foreground">
                    {page.title}
                  </td>
                  <td className="p-4 text-muted-foreground font-mono text-xs hidden sm:table-cell">
                    {page.slug}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="secondary"
                      className={
                        page.type === "landing"
                          ? "bg-accent/10 text-accent"
                          : ""
                      }
                    >
                      {page.type === "landing" ? "Landing" : "Page"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        page.status === "published" ? "default" : "secondary"
                      }
                      className={
                        page.status === "published"
                          ? "bg-success text-success-foreground"
                          : ""
                      }
                    >
                      {page.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewPage(page)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(page);
                          setForm({
                            title: page.title,
                            slug: page.slug,
                            type: page.type,
                            status: page.status,
                            content: page.content,
                            seo_title: page.seo_title,
                            seo_description: page.seo_description,
                            banner_image: page.banner_image,
                          });
                          setDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setPages(pages.filter((p) => p.id !== page.id));
                          toast.success("Page deleted");
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
                    colSpan={5}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No pages found.
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
