import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import { listCreditApplications, listGenerationLogs, listUsersForAdmin } from "@/lib/admin/queries";
import { adjustUserCredits, reviewApplication, updateUserRole } from "@/app/admin/actions";
import { MobileShell } from "@/components/layout/mobile-shell";

export default async function AdminPage() {
  const currentUser = await getCurrentAppUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "admin" && currentUser.role !== "super_admin") {
    redirect("/");
  }

  const [users, applications, logs] = await Promise.all([
    listUsersForAdmin(),
    listCreditApplications(),
    listGenerationLogs(),
  ]);

  return (
    <MobileShell
      title="后台管理"
      subtitle="按 1080 × 1920 手机工作区展示角色、额度、审批和使用记录。"
      topRight={
        <Link
          href="/"
          className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          返回前台
        </Link>
      }
    >
      <div className="flex h-full flex-col p-4">
        <div className="rounded-[24px] bg-slate-900 p-4 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Admin Console</p>
          <div className="mt-2 text-lg font-semibold">{currentUser.username}</div>
          <div className="mt-1 text-sm text-slate-300">当前角色：{currentUser.role}</div>
        </div>

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto pb-1">
          <section className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">角色与额度管理</h2>
            <div className="mt-4 space-y-3">
              {users.map((user) => (
                <div key={user.userId} className="rounded-2xl border border-[var(--line)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{user.username}</div>
                      <div className="mt-1 text-sm text-slate-500">角色：{user.role}</div>
                      <div className="mt-1 text-sm text-slate-500">额度：{user.remainingCredits}</div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-3">
                    {currentUser.role === "super_admin" ? (
                      <form action={updateUserRole} className="flex gap-2">
                        <input type="hidden" name="userId" value={user.userId} />
                        <select name="role" defaultValue={user.role}>
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                          <option value="super_admin">super_admin</option>
                        </select>
                        <button type="submit" className="rounded-full border border-[var(--line)] px-3 py-2 text-sm">
                          保存角色
                        </button>
                      </form>
                    ) : (
                      <p className="text-xs text-[var(--muted)]">仅超级管理员可修改角色</p>
                    )}

                    <form action={adjustUserCredits} className="flex gap-2">
                      <input type="hidden" name="userId" value={user.userId} />
                      <input type="hidden" name="reason" value="admin_adjustment" />
                      <input name="delta" type="number" placeholder="如 5 或 -2" className="max-w-36" />
                      <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
                        调整额度
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">额度申请审批</h2>
            <div className="mt-4 space-y-3">
              {applications.length ? (
                applications.map((application) => (
                  <div key={application.id} className="rounded-2xl border border-[var(--line)] p-4">
                    <div className="font-medium text-slate-900">{application.username}</div>
                    <div className="mt-1 text-sm text-slate-500">申请额度：{application.requested_credits}</div>
                    <div className="mt-1 text-sm text-slate-500">状态：{application.status}</div>
                    <div className="mt-2 text-sm text-slate-700">{application.reason}</div>

                    {application.status === "pending" ? (
                      <form action={reviewApplication} className="mt-3 space-y-2">
                        <input type="hidden" name="applicationId" value={application.id} />
                        <textarea
                          name="reviewNote"
                          rows={2}
                          className="w-full rounded-2xl border border-[var(--line)] px-4 py-3"
                          placeholder="审批备注"
                        />
                        <div className="flex gap-2">
                          <button type="submit" name="action" value="approved" className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white">
                            批准
                          </button>
                          <button type="submit" name="action" value="rejected" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-slate-700">
                            驳回
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">暂无申请记录。</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">使用记录</h2>
            <div className="mt-4 space-y-3">
              {logs.length ? (
                logs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-[var(--line)] p-4 text-sm text-slate-700">
                    <div className="font-medium text-slate-900">{log.username}</div>
                    <div className="mt-1">状态：{log.status}</div>
                    <div className="mt-1">比例：{log.ratio_key}</div>
                    <div className="mt-1">清晰度：{log.quality_key}</div>
                    <div className="mt-1">张数：{log.image_count}</div>
                    <div className="mt-1">扣费：{log.credits_charged}</div>
                    <div className="mt-1 text-[var(--muted)]">
                      {new Date(log.created_at).toLocaleString("zh-CN")}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">暂无使用记录。</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </MobileShell>
  );
}
