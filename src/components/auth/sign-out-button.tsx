import { signOut } from "@/app/login/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-slate-700"
      >
        退出
      </button>
    </form>
  );
}
