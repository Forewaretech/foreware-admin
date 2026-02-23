import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BlogPostType } from "@/hooks/post/postService";
import { useDeletePost } from "@/hooks/post/useDeletePost";
import usePosts from "@/hooks/post/usePosts";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PostModificationDialog from "./PostModificationDialog";

export default function BlogPosts() {
  const { data: posts, isLoading: isLoadingPosts } = usePosts();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostType | null>(null);

  const { mutate: deletePost, isPending } = useDeletePost();

  const handleDelete = (id: string) => {
    deletePost(id, {
      onSuccess: () => toast.success("Post deleted"),
    });
  };

  const handleEdit = (post: BlogPostType) => {
    setEditingPost(post);
    setDialogOpen(true);
  };

  const handleNewPost = () => {
    setEditingPost(null); // Clear the post data
    setDialogOpen(true); // Open dialog
  };

  const filtered = isLoadingPosts
    ? []
    : posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleNewPost}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 ml-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <PostModificationDialog
            defatultPost={editingPost}
            setDialogOpen={setDialogOpen}
            isEditPost={!!editingPost?.id}
          />
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary">
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Title
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                  Category
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                  Date
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            {isLoadingPosts ? (
              <tbody>
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-muted-foreground"
                  >
                    Loading posts...
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {filtered.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b last:border-0 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {post.featuredImage && (
                          <img
                            src={post.featuredImage}
                            alt=""
                            className="w-10 h-10 rounded object-cover shrink-0"
                          />
                        )}
                        <div>
                          <span className="font-medium text-foreground">
                            {post.title}
                          </span>
                          <p className="text-xs text-muted-foreground font-mono">
                            /{post.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 lowercase">
                      <Badge
                        variant={
                          post.status === "PUBLISHED" ? "default" : "secondary"
                        }
                        className={
                          post.status === "PUBLISHED"
                            ? "bg-success text-success-foreground"
                            : ""
                        }
                      >
                        {post.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">
                      {post.category}
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
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
                      No posts found.
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
