"use client";

import Link from "next/link";
import { useState } from "react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { ToolTabs } from "@/components/tool-tabs";
import { CompressPanel } from "@/features/compress/compress-panel";
import { StitchPanel } from "@/features/stitch/stitch-panel";
import { IdPhotoPanel } from "@/features/id-photo/id-photo-panel";
import { AiImagePanel } from "@/features/ai-image/ai-image-panel";
import type { ToolTab } from "@/lib/image/shared";

export function Workspace({
  username,
  role,
  remainingCredits,
  signOut,
}: {
  username: string;
  role: string;
  remainingCredits: number;
  signOut: React.ReactNode;
}) {
  const [tab, setTab] = useState<ToolTab>("compress");

  return (
    <MobileShell
      title="图像助手"
      subtitle="按 1080 × 1920 手机工作区设计，登录后即可本地处理图片。"
      topRight={signOut}
    >
      <div className="flex h-full flex-col p-4">
        <div className="rounded-[24px] bg-slate-900 p-4 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Supabase Auth</p>
          <div className="mt-2 text-lg font-semibold">欢迎回来</div>
          <div className="mt-1 text-sm text-slate-300">{username}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-amber-400/20 px-3 py-1 text-xs text-amber-200">
              {role}
            </span>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
              剩余额度：{role === "super_admin" ? "无限" : remainingCredits}
            </span>
            {role === "admin" || role === "super_admin" ? (
              <Link href="/admin" className="inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-100">
                进入后台
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto pb-1">
          <ToolTabs value={tab} onChange={setTab} />

          <div className="mt-4">
            {tab === "compress" ? <CompressPanel /> : null}
            {tab === "stitch" ? <StitchPanel /> : null}
            {tab === "id-photo" ? <IdPhotoPanel /> : null}
            {tab === "ai-image" ? (
              <AiImagePanel remainingCredits={remainingCredits} role={role} />
            ) : null}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
