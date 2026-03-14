import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { AxiosError } from "axios";

// 1. Define the validation schema
const resetPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // sets the error specifically to this field
  });

// Infer the type from the schema
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  // 2. Initialize useForm with the resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    try {
      console.log("Form Data:", data);
      await apiClient.post("/auth/reset-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.message("Password Reset");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(`Unable to reset password: ${error.response.data.message}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Change Password
        </h2>
        <div className="space-y-3">
          <div>
            <Label>Current Password</Label>
            <Input type="password" {...register("currentPassword")} />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label>New Password</Label>
            <Input type="password" {...register("newPassword")} />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label>Confirm Password</Label>
            <Input type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
        <Button
          type="submit"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default ResetPassword;
