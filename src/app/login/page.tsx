import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileShell } from "@/components/layout/mobile-shell";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <MobileShell
      title="图像助手"
      subtitle="先登录，再在手机端使用图片压缩、长图拼接和证件照工具。"
    >
      <div className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="rounded-[24px] bg-linear-to-br from-blue-600 to-cyan-400 p-5 text-white">
            <p className="text-sm text-blue-50">移动端图片工具</p>
            <h2 className="mt-2 text-2xl font-semibold">用户名密码登录</h2>
            <p className="mt-3 text-sm leading-6 text-blue-50">
              可直接注册账号并登录，不再使用邮件登录链接。
            </p>
          </div>

          <div className="mt-5 rounded-[24px] bg-white p-5">
            <LoginForm />
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-[var(--muted)]">
          用户名仅支持字母、数字和下划线。
        </p>
      </div>
    </MobileShell>
  );
}
