import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogPostType, postSchema } from "@/hooks/post/postService";
import { useCreatePost } from "@/hooks/post/useCreatePost";
import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUpdatePost } from "@/hooks/post/useUpdatePost";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteFromS3, uploadToS3 } from "@/lib/s3Helpers";

interface Props {
  defatultPost?: BlogPostType;
  setDialogOpen?: (open: boolean) => void;
  isEditPost?: boolean;
}
const PostModificationDialog = ({
  defatultPost,
  setDialogOpen,
  isEditPost,
}: Readonly<Props>) => {
  const { mutate, isPending } = useCreatePost();
  const { mutate: updatePostMutate, isPending: isPendingUpdatePost } =
    useUpdatePost();
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<BlogPostType>({
    resolver: zodResolver(postSchema),
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Watch values for slug generation and image preview
  const watchedTitle = watch("title");
  const watchedImageUrl = watch("featuredImage");

  // Auto-generate slug when title changes
  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue("title", title);
    setValue("slug", generateSlug(title), { shouldValidate: true });
  };

  const handleImageSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // 1. Store the actual file for the upload later
      setSelectedFile(file);

      // 2. Store the preview URL in the form
      const previewUrl = URL.createObjectURL(file);
      setValue("featuredImage", previewUrl, { shouldDirty: true });

      toast.success("Image ready for upload");
    };
    input.click();
  };

  const onSubmit = async (data: BlogPostType) => {
    try {
      let finalImageUrl = data.featuredImage;

      // If a new local file was selected, upload it first
      if (selectedFile) {
        setIsUploadingFile(true);
        toast.loading("Uploading image...", { id: "upload" });
        finalImageUrl = await uploadToS3(selectedFile);
        toast.success("Image uploaded", { id: "upload" });
        setIsUploadingFile(false);
      }

      const payload = { ...data, featuredImage: finalImageUrl };

      if (isEditPost) {
        updatePostMutate(
          { id: defatultPost.id, data: payload },
          {
            onSuccess: () => {
              toast.success("Post updated!");
              setDialogOpen(false);
              reset();
              setIsUploadingFile(false);
            },
            onError: async (error, variables, context) => {
              console.log("error: ", error);
              deleteFromS3(finalImageUrl);
              setIsUploadingFile(false);
            },
          },
        );
      } else {
        mutate(payload, {
          onSuccess: () => {
            toast.success("Post created!");
            setDialogOpen(false);
            reset();
            setIsUploadingFile(false);
          },
          onError: async (error, variables, context) => {
            deleteFromS3(finalImageUrl);
            setIsUploadingFile(false);
          },
        });
      }
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      toast.error("Uploading image failed", { id: "upload" });
      console.error(error);
      setIsUploadingFile(false);
    }
  };

  useEffect(() => {
    setSelectedFile(null); // Reset the file state
    if (defatultPost) {
      // Convert any null values from the DB to empty strings for the form inputs
      const sanitizedPost = Object.entries(defatultPost).reduce(
        (acc, [key, value]) => {
          acc[key] = value === null ? "" : value;
          return acc;
        },
        { status: "DRAFT" } as any,
      );
      reset(sanitizedPost);
    } else {
      // Ensure EVERY field is reset to its empty state
      reset({
        title: "",
        slug: "",
        category: "",
        status: "DRAFT",
        featuredImage: "", // <--- Crucial
        featuredImageTitle: "",
        featuredImageCaption: "",
        summary: "",
        content: "",
        seoTitle: "",
        seoDescription: "",
      });
    }
  }, [defatultPost, isEditPost, reset]);

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEditPost ? "Edit Post" : "New Blog Post"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Title *</Label>
              <Input
                {...register("title")}
                onChange={handleTitleChange}
                placeholder="Post title"
              />
              {errors.title && (
                <p className="text-xs text-destructive mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <Label>Author</Label>
              <Input
                {...register("author")}
                placeholder="Author"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                {...register("slug")}
                placeholder="auto-generated-from-title"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL path for this post (auto-generated from title)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <Input
                {...register("category")}
                placeholder="e.g. Guides, Tips"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>Featured Image</Label>
              <div className="flex gap-2">
                <Input
                  {...register("featuredImage")}
                  placeholder="URL or upload"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleImageSelect}
                  title="Upload image"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          {watchedImageUrl && (
            <img
              src={watchedImageUrl}
              alt={getValues().featuredImageTitle || "Featured"}
              className="w-full max-h-48 object-cover rounded-lg"
            />
          )}
          {watchedImageUrl && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Image Alt Text (SEO)</Label>
                <Input
                  {...register("featuredImageTitle")}
                  placeholder="Describe the image for accessibility"
                />
              </div>
              <div>
                <Label>Image Caption</Label>
                <Input
                  {...register("featuredImageCaption")}
                  placeholder="Caption displayed below image"
                />
              </div>
            </div>
          )}
          <div>
            <div>
              <Label>Summary</Label>
              <Input
                {...register("summary")}
                placeholder="Summary display on card"
              />
            </div>
            <Label>Content</Label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Write your blog post..."
                />
              )}
            />
            {errors.content && (
              <p className="text-xs text-destructive mt-1">
                {errors.content.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>SEO Title</Label>
              <Input
                {...register("seoTitle")}
                placeholder="SEO title (max 60 chars)"
                maxLength={60}
              />
              {errors.seoTitle && (
                <p className="text-xs text-destructive mt-1">
                  {errors.seoTitle.message}
                </p>
              )}
            </div>
            <div>
              <Label>SEO Description</Label>
              <Input
                {...register("seoDescription")}
                placeholder="SEO description (max 160 chars)"
                maxLength={160}
              />
              {errors.seoDescription && (
                <p className="text-xs text-destructive mt-1">
                  {errors.seoDescription.message}
                </p>
              )}
            </div>
          </div>
          {isEditPost ? (
            <Button
              type="submit"
              disabled={
                (!isDirty && !selectedFile) ||
                isPendingUpdatePost ||
                isUploadingFile
              }
              className="w-full bg-accent text-accent-foreground"
            >
              {isPending || isUploadingFile ? "Updating..." : "Update Post"}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending || isUploadingFile}
              className="w-full bg-accent text-accent-foreground"
            >
              {isPending || isUploadingFile ? "Creating..." : "Create Post"}
            </Button>
          )}
        </div>
      </form>
    </DialogContent>
  );
};

export default PostModificationDialog;
