import { getCurrentUser } from "@/lib/auth/dal";
import { ProfileForm } from "@/features/settings/profile/components/profile-form";
import { ChangePasswordForm } from "@/features/settings/profile/components/change-password-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Profile</h1>
      <p className="mt-1 text-sm text-steel">Your account details.</p>

      <div className="mt-6">
        <ProfileForm user={user} />
      </div>

      <h2 className="mt-10 font-serif text-lg text-ink">Password</h2>
      <div className="mt-4">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
