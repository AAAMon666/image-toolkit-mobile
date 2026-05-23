"use client";

import { useActionState } from "react";
import { authenticate, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(authenticate, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-800">
          用户名
        </label>
        <input id="username" name="username" type="text" placeholder="例如 Zhouyi" />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-800">
          密码
        </label>
        <input id="password" name="password" type="password" placeholder="请输入密码" />
      </div>

      {state.error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{state.error}</p>
      ) : null}

      {state.success ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="submit"
          name="mode"
          value="sign-in"
          disabled={pending}
          className="rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white disabled:bg-slate-300"
        >
          {pending ? "提交中..." : "登录"}
        </button>
        <button
          type="submit"
          name="mode"
          value="sign-up"
          disabled={pending}
          className="rounded-full border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium text-slate-700 disabled:bg-slate-100"
        >
          {pending ? "提交中..." : "注册"}
        </button>
      </div>
    </form>
  );
}
