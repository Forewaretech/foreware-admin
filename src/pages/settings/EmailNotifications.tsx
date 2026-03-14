import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailNotiSchema, EmailToType } from "@/hooks/emailto/emailToService";
import useAddEmailTo from "@/hooks/emailto/useAddEmailTo";
import useEmailsTo from "@/hooks/emailto/useEmailsTo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const EmailNotifications = () => {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(emailNotiSchema),
  });

  const { data } = useEmailsTo();
  const { mutate, isPending } = useAddEmailTo();

  const emailTo = data?.data[0] ?? {};

  const onSubmit = (data: EmailToType) => {
    mutate(data, {
      onSuccess() {
        toast.message("Email upadated");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Email Notifications
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure where form submissions are sent. Individual form emails can
          be set in the Forms & Pop-ups section.
        </p>
        <div className="space-y-3">
          <div>
            <Label>Default Notification Email</Label>
            <Input
              {...register("email")}
              placeholder="info@foreware.io"
              defaultValue={emailTo?.email || ""}
            />
          </div>
          <div>
            <Label>CC Email (optional)</Label>
            <Input
              {...register("cc")}
              placeholder="cc@foreware.io"
              defaultValue={emailTo?.cc || ""}
            />
          </div>
        </div>
        <Button
          disabled={isPending}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default EmailNotifications;
