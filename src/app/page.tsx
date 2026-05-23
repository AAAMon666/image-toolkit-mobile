import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Workspace } from "@/components/workspace";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const currentUser = await getCurrentAppUser();
  if (!currentUser) {
    redirect("/login");
  }

  return (
    <Workspace
      username={currentUser.username}
      role={currentUser.role}
      remainingCredits={currentUser.remainingCredits}
      signOut={<SignOutButton />}
    />
  );
}
