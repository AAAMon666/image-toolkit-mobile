"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const authSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "用户名至少 3 位")
    .regex(/^[A-Za-z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
  password: z.string().min(6, "密码至少 6 位"),
  mode: z.enum(["sign-in", "sign-up"]),
});

export type LoginState = {
  error?: string;
  success?: string;
};

function usernameToEmail(username: string) {
  return `${username.toLowerCase()}@local.image-toolkit-mobile.app`;
}

export async function authenticate(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = authSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    mode: formData.get("mode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "输入不合法" };
  }

  const { username, password, mode } = parsed.data;
  const supabase = await createClient();
  const email = usernameToEmail(username);

  if (mode === "sign-up") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      const admin = await createAdminClient();
      await admin.rpc("initialize_user_account", {
        p_user_id: data.user.id,
        p_username: username,
        p_role: "user",
        p_initial_credits: 2,
      });
      await admin.auth.admin.updateUserById(data.user.id, {
        app_metadata: { role: "user" },
      });
    }

    redirect("/");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "用户名或密码错误" };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
