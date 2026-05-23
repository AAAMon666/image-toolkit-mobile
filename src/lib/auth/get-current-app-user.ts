import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type CurrentAppUser = {
  id: string;
  username: string;
  role: string;
  remainingCredits: number;
};

export async function getCurrentAppUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const admin = await createAdminClient();
  const [{ data: profile }, { data: credits }] = await Promise.all([
    admin
      .from("profiles")
      .select("username, role")
      .eq("user_id", user.id)
      .maybeSingle(),
    admin
      .from("credit_accounts")
      .select("remaining_credits")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return {
    id: user.id,
    username: profile?.username ?? user.user_metadata.username ?? user.email ?? "已登录用户",
    role: profile?.role ?? user.app_metadata.role ?? "user",
    remainingCredits: credits?.remaining_credits ?? 0,
  } satisfies CurrentAppUser;
}
