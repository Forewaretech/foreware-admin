import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormFieldEnum,
  FormStatusEnum,
  TriggerEnum,
} from "@/hooks/form/formService";
import { useCreateForm } from "@/hooks/form/useCreateForm";
import { useDeleteForm } from "@/hooks/form/useDeleteForm";
import { useEditForm } from "@/hooks/form/useEditForm";
import useMyForms from "@/hooks/form/useForms";
import { deleteFromS3, uploadToS3 } from "@/lib/s3Helpers";
import { Edit2, Eye, ImageIcon, Plus, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FormItem {
  id: string;
  name: string;
  fields: FormField[];
  thankYouMessage: string;
  targetEmails: string[];
  status: string;
  triggerType: string;
  assignedPages: string[];
  submissions: number;
  bannerImage: string;
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "textarea", label: "Text Area" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
];

export default function FormsPopups() {
  // const [forms, setForms] = useState<FormItem[]>(initialForms);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<FormItem | null>(null);
  const [editing, setEditing] = useState<FormItem | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [finalBannerImageUrl, setFinalBannerImageUrl] = useState("");

  const { mutate: mutateForm, isPending } = useCreateForm();
  const { mutate: mutateEditForm, isPending: isPendingEdit } = useEditForm();
  const { mutate: deleteForm, isPending: isPendingDelete } = useDeleteForm();

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data, isLoading: isLoadingForms } = useMyForms();

  const myForms = data ? data.data : [];

  const [form, setForm] = useState({
    name: "",
    triggerType: TriggerEnum.embed,
    targetEmails: "",
    fields: "" as string,
    thankYouMessage: "",
    assignedPages: "",
    bannerImage: "",
  });
  const [fieldsList, setFieldsList] = useState<FormField[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (fieldsList.length === 0) e.fields = "At least one field is required";
    if (
      fieldsList.some(
        (f) =>
          f.type === FormFieldEnum.SELECT &&
          (!f.options || f.options.filter(Boolean).length < 2),
      )
    )
      e.fields = "Dropdown fields need at least 2 options";
    const emails = form.targetEmails
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emails.length > 0 && emails.some((em) => !emailRegex.test(em)))
      e.target_emails = "Invalid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const emails = form.targetEmails
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const pages = form.assignedPages
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      if (editing) {
        if (editing) {
          let finalImageUrl = form.bannerImage;

          // If a new banner file was selected, upload first
          if (bannerImage) {
            setIsUploadingImage(true);
            toast.loading("Uploading banner image...", { id: "upload" });

            finalImageUrl = await uploadToS3(bannerImage, "form");

            toast.success("Banner image uploaded", { id: "upload" });
            setIsUploadingImage(false);
          }

          const updatePayload = {
            name: form.name,
            triggerType: form.triggerType,
            bannerImage: finalImageUrl || undefined,
            thankYouMessage: form.thankYouMessage,
            targetEmails: emails,
            assignedPages: pages,
            fields: fieldsList,
          };

          mutateEditForm(
            {
              id: editing.id,
              data: updatePayload,
            },
            {
              onSuccess: () => {
                toast.success("Form updated successfully");
                setDialogOpen(false);
                resetForm();
              },
              onError: async () => {
                if (bannerImage && finalImageUrl) {
                  if (bannerImage) deleteFromS3(finalBannerImageUrl);
                }
              },
            },
          );

          return;
        }
      } else {
        let finalImageUrl = form.bannerImage;

        // If a new local file was selected, upload it first
        if (bannerImage) {
          setIsUploadingImage(true);
          toast.loading("Uploading banner image...", { id: "upload" });
          finalImageUrl = await uploadToS3(bannerImage, "form");
          setFinalBannerImageUrl(finalImageUrl);
          toast.success("Banner image uploaded", { id: "upload" });
          setIsUploadingImage(false);
        }

        const data = {
          name: form.name,
          triggerType: form.triggerType,
          bannerImage: finalImageUrl,
          thankYouMessage: form.thankYouMessage,
          status: FormStatusEnum.inactive,
          targetEmails: emails,
          assignedPages: pages,
          fields: fieldsList,
        };

        console.log("DATA: ", data);

        mutateForm(data, {
          onSuccess() {
            toast.message("Form created successfully");
            setDialogOpen(false);
          },

          onError: async () => {
            if (bannerImage) deleteFromS3(finalBannerImageUrl);
          },
        });
        console.log("DATA: ", data);
      }
    } catch (error) {
      if (bannerImage) deleteFromS3(finalBannerImageUrl);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      triggerType: TriggerEnum.embed,
      targetEmails: "",
      fields: "",
      thankYouMessage: "",
      assignedPages: "",
      bannerImage: "",
    });
    setFieldsList([]);
    setErrors({});
  };

  const addField = () =>
    setFieldsList([
      ...fieldsList,
      { label: "", type: FormFieldEnum.TEXT, required: true },
    ]);

  const updateField = (idx: number, key: string, value: string | boolean) => {
    setFieldsList(
      fieldsList.map((f, i) => (i === idx ? { ...f, [key]: value } : f)),
    );
  };

  const updateFieldOptions = (idx: number, optionsStr: string) => {
    const options = optionsStr.split(",").map((o) => o.trim());
    setFieldsList(
      fieldsList.map((f, i) => (i === idx ? { ...f, options } : f)),
    );
  };

  const removeField = (idx: number) =>
    setFieldsList(fieldsList.filter((_, i) => i !== idx));

  const handleBannerSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setBannerImage(file);
      setForm((f) => ({ ...f, banner_image: URL.createObjectURL(file) }));
      toast.success("Banner image selected");
    };
    input.click();
  };

  const triggerLabels: Record<string, string> = {
    embed: "Form",
    popup_load: "Pop-up (Load)",
    popup_scroll: "Pop-up (Scroll)",
    popup_time: "Pop-up (Timer)",
  };

  const filtered = myForms?.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search forms & pop-ups..."
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
              New Form / Pop-up
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit" : "New Form / Pop-up"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Form name"
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label>Type / Trigger</Label>
                <Select
                  value={form.triggerType}
                  onValueChange={(v) =>
                    setForm({ ...form, triggerType: v as TriggerEnum })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="embed">Embedded Form</SelectItem>
                    <SelectItem value="popup_load">
                      Pop-up (Page Load)
                    </SelectItem>
                    <SelectItem value="popup_scroll">
                      Pop-up (Scroll)
                    </SelectItem>
                    <SelectItem value="popup_time">
                      Pop-up (Time Delay)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Banner Image */}
              <div>
                <Label>Banner Image</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={form.bannerImage}
                    onChange={(e) =>
                      setForm({ ...form, bannerImage: e.target.value })
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
                  {form.bannerImage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setForm({ ...form, bannerImage: "" })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {form.bannerImage && (
                  <img
                    src={form.bannerImage}
                    alt="Banner"
                    className="w-full max-h-32 object-cover rounded-lg mt-2"
                  />
                )}
              </div>

              {/* Fields Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Form Fields *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addField}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Field
                  </Button>
                </div>
                {errors.fields && (
                  <p className="text-xs text-destructive mb-2">
                    {errors.fields}
                  </p>
                )}
                <div className="space-y-2">
                  {fieldsList.map((field, idx) => (
                    <div
                      key={idx}
                      className="p-2 border rounded-lg bg-secondary/30 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          value={field.label}
                          onChange={(e) =>
                            updateField(idx, "label", e.target.value)
                          }
                          placeholder="Field label"
                          className="flex-1"
                        />
                        <Select
                          value={field.type}
                          onValueChange={(v) => updateField(idx, "type", v)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              updateField(idx, "required", e.target.checked)
                            }
                          />
                          Req
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeField(idx)}
                          className="shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      {field.type === "select" && (
                        <div className="pl-1">
                          <Input
                            value={(field.options || []).join(", ")}
                            onChange={(e) =>
                              updateFieldOptions(idx, e.target.value)
                            }
                            placeholder="Option 1, Option 2, Option 3 (comma-separated)"
                            className="text-xs"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter dropdown options separated by commas
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  {fieldsList.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3 border rounded-lg border-dashed">
                      Click "Add Field" to start building your form
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Email Notifications To</Label>
                <Input
                  value={form.targetEmails}
                  onChange={(e) =>
                    setForm({ ...form, targetEmails: e.target.value })
                  }
                  placeholder="email@company.com, sales@company.com"
                />
                {errors.target_emails && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.target_emails}
                  </p>
                )}
              </div>
              <div>
                <Label>Thank You Message</Label>
                <Textarea
                  value={form.thankYouMessage}
                  onChange={(e) =>
                    setForm({ ...form, thankYouMessage: e.target.value })
                  }
                  placeholder="Message shown after submission"
                />
              </div>
              <div>
                <Label>Show on Pages (comma-separated slugs)</Label>
                <Input
                  value={form.assignedPages}
                  onChange={(e) =>
                    setForm({ ...form, assignedPages: e.target.value })
                  }
                  placeholder="/contact, /blog, /pricing"
                />
              </div>
              <Button
                disabled={isPending || isUploadingImage}
                onClick={handleSave}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isPending || isUploadingImage ? (
                  <span>Loading...</span>
                ) : (
                  <span>{editing ? "Update" : "Create"}</span>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Interactive Preview Modal */}
      <FormPreviewDialog
        form={previewForm}
        onClose={() => setPreviewForm(null)}
      />

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary">
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Name
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">
                  Pages
                </th>
                {/*TODO: <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                  Submissions
                </th> */}
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Active
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr
                  key={f.id}
                  className="border-b last:border-0 hover:bg-secondary/50 transition-colors"
                >
                  <td className="p-4 font-medium text-foreground">{f.name}</td>
                  <td className="p-4">
                    <Badge
                      variant="secondary"
                      className={
                        f.triggerType.toLowerCase().startsWith("popup")
                          ? "bg-warning/10 text-warning"
                          : ""
                      }
                    >
                      {triggerLabels[f.triggerType.toLowerCase()] ||
                        f.triggerType.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs font-mono hidden sm:table-cell">
                    {f.assignedPages.join(", ") || "-"}
                  </td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">
                    {/* TODO: Fix Submission */}
                    {/* {f?.submissions} */}
                  </td>
                  <td className="p-4">
                    <Switch
                      checked={f.status.toLowerCase() === FormStatusEnum.active}
                      onCheckedChange={() => {
                        mutateEditForm({
                          id: f.id,
                          data: {
                            status:
                              f.status.toLowerCase() === FormStatusEnum.active
                                ? FormStatusEnum.inactive
                                : FormStatusEnum.active,
                          },
                        });
                      }}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewForm(f)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(f);
                          setForm({
                            name: f.name,
                            triggerType:
                              f.triggerType.toLowerCase() as TriggerEnum,
                            targetEmails: f.targetEmails.join(", "),
                            thankYouMessage: f.thankYouMessage,
                            assignedPages: f.assignedPages.join(", "),
                            bannerImage: f.bannerImage,
                          });
                          setFieldsList(f.fields.map((ff) => ({ ...ff })));
                          setDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          deleteForm(f.id, {
                            onSuccess: () => {
                              toast.success("Form deleted successfully");
                            },
                            onError: () => {
                              toast.error("Failed to delete form");
                            },
                          });
                        }}
                        // onClick={() => {
                        //   setForms(forms.filter((x) => x.id !== f.id));
                        //   toast.success("Form deleted");
                        // }}
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
                    No forms found.
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

/* Interactive form preview as a separate component */
function FormPreviewDialog({
  form,
  onClose,
}: {
  form: FormItem | null;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const missing = form.fields.filter(
      (f) => f.required && !values[f.label]?.trim(),
    );
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setSubmitted(true);
    toast.success("Form submitted (preview)");
  };

  const handleClose = () => {
    setValues({});
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog
      open={!!form}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Preview: {form?.name}</DialogTitle>
        </DialogHeader>
        {form && (
          <div className="mt-2 border rounded-lg overflow-hidden">
            {form.bannerImage && (
              <img
                src={form.bannerImage}
                alt="Banner"
                className="w-full h-36 object-cover"
              />
            )}
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {submitted ? (
                <div className="text-center py-6">
                  <p className="text-lg font-semibold text-foreground mb-1">
                    ✓ Submitted!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {form.thankYouMessage || "Thank you for your submission."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSubmitted(false);
                      setValues({});
                    }}
                  >
                    Reset
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-foreground">{form.name}</h3>
                  {form.fields.map((field, idx) => (
                    <div key={idx}>
                      <label className="text-sm font-medium text-foreground">
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-destructive">*</span>
                        )}
                      </label>
                      <div className="mt-1">
                        {field.type === "textarea" ? (
                          <textarea
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder={field.label}
                            rows={3}
                            value={values[field.label] || ""}
                            onChange={(e) =>
                              setValues({
                                ...values,
                                [field.label]: e.target.value,
                              })
                            }
                          />
                        ) : field.type === "select" ? (
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={values[field.label] || ""}
                            onChange={(e) =>
                              setValues({
                                ...values,
                                [field.label]: e.target.value,
                              })
                            }
                          >
                            <option value="">Select {field.label}</option>
                            {(field.options || [])
                              .filter(Boolean)
                              .map((opt, oi) => (
                                <option key={oi} value={opt}>
                                  {opt}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder={field.label}
                            value={values[field.label] || ""}
                            onChange={(e) =>
                              setValues({
                                ...values,
                                [field.label]: e.target.value,
                              })
                            }
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="submit"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Submit
                  </Button>
                </>
              )}
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
