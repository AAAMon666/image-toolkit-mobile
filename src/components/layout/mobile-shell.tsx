import type { ReactNode } from "react";

export function MobileShell({
  title,
  subtitle,
  topRight,
  children,
}: {
  title: string;
  subtitle: string;
  topRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6 sm:px-6">
      <section className="rounded-[32px] border border-white/60 bg-white/88 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600">1080 × 1920 移动端画布</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{subtitle}</p>
          </div>
          {topRight}
        </div>
        <div className="mx-auto flex aspect-[9/16] w-full max-w-[420px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-inner">
          {children}
        </div>
      </section>
    </main>
  );
}
