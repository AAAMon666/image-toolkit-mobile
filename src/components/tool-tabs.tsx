"use client";

import type { ToolTab } from "@/lib/image/shared";
import clsx from "clsx";

const tabs: { id: ToolTab; label: string; description: string }[] = [
  { id: "compress", label: "图片压缩", description: "减小文件体积" },
  { id: "stitch", label: "拼接长图", description: "任意尺寸纵向拼接" },
  { id: "id-photo", label: "证件照", description: "常用尺寸裁切导出" },
];

export function ToolTabs({
  value,
  onChange,
}: {
  value: ToolTab;
  onChange: (value: ToolTab) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={clsx(
            "rounded-2xl border p-3 text-left transition",
            value === tab.id
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-[var(--line)] bg-white text-slate-700",
          )}
        >
          <div className="text-sm font-semibold">{tab.label}</div>
          <div className="mt-1 text-xs text-[var(--muted)]">{tab.description}</div>
        </button>
      ))}
    </div>
  );
}
