import EmailNotifications from "./EmailNotifications";
import ResetPassword from "./ResetPassword";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <ResetPassword />
      <EmailNotifications />
    </div>
  );
}
