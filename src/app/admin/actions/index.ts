"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";

function assertAdminRole(role: string) {
  if (role !== "admin" && role !== "super_admin") {
    throw new Error("无权限");
  }
}

function assertSuperAdminRole(role: string) {
  if (role !== "super_admin") {
    throw new Error("仅超级管理员可操作");
  }
}

export async function updateUserRole(formData: FormData) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) {
    throw new Error("未登录");
  }

  assertSuperAdminRole(currentUser.role);

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "user");
  const admin = await createAdminClient();

  await admin.from("profiles").update({ role }).eq("user_id", userId);
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  });

  revalidatePath("/admin");
}

export async function adjustUserCredits(formData: FormData) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) {
    throw new Error("未登录");
  }

  assertAdminRole(currentUser.role);

  const userId = String(formData.get("userId") ?? "");
  const delta = Number(formData.get("delta") ?? 0);
  const reason = String(formData.get("reason") ?? "admin_adjustment");
  const admin = await createAdminClient();

  await admin.rpc("adjust_credits", {
    p_user_id: userId,
    p_delta: delta,
    p_reason: reason,
    p_operator_user_id: currentUser.id,
  });

  revalidatePath("/admin");
}

export async function reviewApplication(formData: FormData) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) {
    throw new Error("未登录");
  }

  assertAdminRole(currentUser.role);

  const applicationId = String(formData.get("applicationId") ?? "");
  const action = String(formData.get("action") ?? "rejected");
  const reviewNote = String(formData.get("reviewNote") ?? "");
  const admin = await createAdminClient();

  const { data: application } = await admin
    .from("credit_applications")
    .select("id, user_id, requested_credits, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (!application || application.status !== "pending") {
    revalidatePath("/admin");
    return;
  }

  if (action === "approved") {
    await admin.rpc("adjust_credits", {
      p_user_id: application.user_id,
      p_delta: application.requested_credits,
      p_reason: "application_approved",
      p_operator_user_id: currentUser.id,
      p_related_request_id: application.id,
    });
  }

  await admin
    .from("credit_applications")
    .update({
      status: action,
      review_note: reviewNote,
      reviewed_by: currentUser.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", application.id);

  revalidatePath("/admin");
}

export async function submitCreditApplication(formData: FormData) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) {
    throw new Error("未登录");
  }

  const requestedCredits = Number(formData.get("requestedCredits") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();
  const admin = await createAdminClient();

  if (requestedCredits <= 0 || !reason) {
    throw new Error("请填写申请额度和理由");
  }

  await admin.from("credit_applications").insert({
    user_id: currentUser.id,
    requested_credits: requestedCredits,
    reason,
  });

  revalidatePath("/");
}
