import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Workspace } from "@/components/workspace";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const username = user.user_metadata.username ?? user.email ?? "已登录用户";
  const role = user.app_metadata.role ?? "user";

  return <Workspace username={username} role={role} signOut={<SignOutButton />} />;
}
