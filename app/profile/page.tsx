import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LogoutButton from "@/components/LogoutButton";
import { EditNameForm, ChangePasswordForm } from "@/components/ProfileForms";
import { getCurrentUser } from "@/lib/current-user";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-gray-200 rounded-card p-5 bg-white">
      <h2 className="font-medium text-sm mb-0.5">{title}</h2>
      <p className="text-xs text-gray-500 mb-4">{description}</p>
      {children}
    </section>
  );
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex">
      <Sidebar physicianName={user.name} />
      <main className="flex-1 p-8 max-w-md">
        <h1 className="text-2xl font-medium mb-1">Profile</h1>
        <p className="text-sm text-gray-500 mb-6 truncate">
          Signed in as {user.email}
        </p>

        <div className="flex flex-col gap-4">
          <Section title="Name" description="How you appear across Synova.">
            <EditNameForm initialName={user.name} />
          </Section>

          <Section
            title="Password"
            description={
              user.hasPassword
                ? "Change the password used to sign in."
                : "Set a password so you can sign in without Google."
            }
          >
            <ChangePasswordForm hasPassword={user.hasPassword} />
          </Section>

          <Section
            title="Log out"
            description="End this session on this device."
          >
            <LogoutButton />
          </Section>
        </div>
      </main>
    </div>
  );
}
