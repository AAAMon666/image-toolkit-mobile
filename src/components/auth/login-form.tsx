"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLink, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-800">
          邮箱登录
        </label>
        <input id="email" name="email" type="email" placeholder="name@example.com" />
      </div>

      {state.error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{state.error}</p>
      ) : null}

      {state.success ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white disabled:bg-slate-300"
      >
        {pending ? "发送中..." : "发送登录链接"}
      </button>
    </form>
  );
}
