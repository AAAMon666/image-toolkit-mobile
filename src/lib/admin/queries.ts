import { createAdminClient } from "@/lib/supabase/admin";

export type AdminUserListItem = {
  userId: string;
  username: string;
  role: string;
  remainingCredits: number;
  createdAt: string;
};

export async function listUsersForAdmin() {
  const admin = await createAdminClient();
  const [{ data: profiles, error: profileError }, { data: accounts, error: accountError }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("user_id, username, role, created_at")
        .order("created_at", { ascending: false }),
      admin.from("credit_accounts").select("user_id, remaining_credits"),
    ]);

  if (profileError) {
    throw profileError;
  }

  if (accountError) {
    throw accountError;
  }

  const accountMap = new Map(
    (accounts ?? []).map((item) => [item.user_id, item.remaining_credits]),
  );

  return (profiles ?? []).map((item) => ({
    userId: item.user_id,
    username: item.username,
    role: item.role,
    remainingCredits: accountMap.get(item.user_id) ?? 0,
    createdAt: item.created_at,
  })) as AdminUserListItem[];
}

export async function listCreditApplications() {
  const admin = await createAdminClient();
  const [{ data: applications, error: applicationError }, { data: profiles, error: profileError }] =
    await Promise.all([
      admin
        .from("credit_applications")
        .select("id, requested_credits, reason, status, review_note, created_at, reviewed_at, user_id")
        .order("created_at", { ascending: false }),
      admin.from("profiles").select("user_id, username"),
    ]);

  if (applicationError) {
    throw applicationError;
  }

  if (profileError) {
    throw profileError;
  }

  const profileMap = new Map((profiles ?? []).map((item) => [item.user_id, item.username]));

  return (applications ?? []).map((item) => ({
    ...item,
    username: profileMap.get(item.user_id) ?? item.user_id,
  }));
}

export async function listGenerationLogs() {
  const admin = await createAdminClient();
  const [{ data: logs, error: logError }, { data: profiles, error: profileError }] =
    await Promise.all([
      admin
        .from("image_generation_logs")
        .select(
          "id, prompt, ratio_key, quality_key, image_count, reference_count, credits_charged, status, error_message, created_at, user_id",
        )
        .order("created_at", { ascending: false })
        .limit(100),
      admin.from("profiles").select("user_id, username"),
    ]);

  if (logError) {
    throw logError;
  }

  if (profileError) {
    throw profileError;
  }

  const profileMap = new Map((profiles ?? []).map((item) => [item.user_id, item.username]));

  return (logs ?? []).map((item) => ({
    ...item,
    username: profileMap.get(item.user_id) ?? item.user_id,
  }));
}
