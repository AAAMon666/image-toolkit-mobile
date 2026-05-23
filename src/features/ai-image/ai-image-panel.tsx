"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ratioOptions, qualityOptions } from "@/lib/ai/config";
import { downloadFromUrl, timestampName } from "@/lib/image/shared";
import { submitCreditApplication } from "@/app/admin/actions";

type GeneratedImage = {
  url: string;
};

export function AiImagePanel({
  remainingCredits,
  role,
}: {
  remainingCredits: number;
  role: string;
}) {
  const [prompt, setPrompt] = useState("");
  const [ratioKey, setRatioKey] = useState<(typeof ratioOptions)[number]["key"]>("square");
  const [qualityKey, setQualityKey] = useState<(typeof qualityOptions)[number]["key"]>("1k");
  const [imageCount, setImageCount] = useState(1);
  const [freeWidth, setFreeWidth] = useState(1);
  const [freeHeight, setFreeHeight] = useState(1);
  const [references, setReferences] = useState<File[]>([]);
  const [generated, setGenerated] = useState<GeneratedImage[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeRatio = useMemo(
    () => ratioOptions.find((item) => item.key === ratioKey) ?? ratioOptions[0],
    [ratioKey],
  );

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("ratioKey", ratioKey);
      formData.append("qualityKey", qualityKey);
      formData.append("imageCount", String(imageCount));
      formData.append("freeWidth", String(freeWidth));
      formData.append("freeHeight", String(freeHeight));
      references.forEach((file) => formData.append("references", file));

      const response = await fetch("/api/ai-image", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "AI 生图失败");
      }

      setGenerated(payload.images ?? []);
      setMessage(
        payload.chargedCredits > 0
          ? `已扣除 ${payload.chargedCredits} 额度。`
          : "超级管理员本次不扣额度。",
      );
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "AI 生图失败");
      setGenerated([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white p-4 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>当前角色</span>
          <span className="font-medium">{role}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span>剩余额度</span>
          <span className="font-medium">{role === "super_admin" ? "无限" : `${remainingCredits}`}</span>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl bg-white p-4">
        <div>
          <label className="mb-2 block text-sm font-medium">提示词</label>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-[var(--line)] px-4 py-3"
            placeholder="例如：一张现代极简风的咖啡品牌海报，暖色调，产品居中展示"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">比例</label>
          <div className="space-y-2">
            {ratioOptions.map((item) => (
              <label key={item.key} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--line)] px-3 py-3">
                <input
                  type="radio"
                  name="ratio"
                  checked={ratioKey === item.key}
                  onChange={() => setRatioKey(item.key)}
                />
                <div>
                  <div className="font-medium text-slate-800">{item.label}</div>
                  <div className="text-xs text-[var(--muted)]">{item.hint}</div>
                </div>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">当前用途提示：{activeRatio.hint}</p>
        </div>

        {ratioKey === "free" ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium">自由宽比</label>
              <input type="number" min="1" value={freeWidth} onChange={(event) => setFreeWidth(Number(event.target.value) || 1)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">自由高比</label>
              <input type="number" min="1" value={freeHeight} onChange={(event) => setFreeHeight(Number(event.target.value) || 1)} />
            </div>
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-medium">清晰度</label>
          <select value={qualityKey} onChange={(event) => setQualityKey(event.target.value as typeof qualityKey)}>
            {qualityOptions.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">生成张数</label>
          <select value={imageCount} onChange={(event) => setImageCount(Number(event.target.value))}>
            <option value={1}>1 张</option>
            <option value={2}>2 张</option>
            <option value={3}>3 张</option>
            <option value={4}>4 张</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">参考图</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(event) => setReferences(Array.from(event.target.files ?? []))}
          />
          {references.length ? (
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[var(--muted)]">
              {references.map((file, index) => (
                <div key={`${file.name}-${index}`} className="truncate rounded-xl border border-[var(--line)] px-2 py-2">
                  {file.name}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          disabled={loading || !prompt.trim()}
          onClick={handleGenerate}
          className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:bg-slate-300"
        >
          {loading ? "生成中..." : `开始生成（${imageCount} 额度）`}
        </button>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {generated.length ? (
        <div className="space-y-3 rounded-3xl bg-white p-4">
          <div className="text-sm font-medium text-slate-800">生成结果预览</div>
          <div className="grid grid-cols-2 gap-3">
            {generated.map((item, index) => (
              <div key={`${item.url}-${index}`} className="rounded-2xl border border-[var(--line)] bg-slate-50 p-2">
                <Image
                  unoptimized
                  src={item.url}
                  alt={`生成结果 ${index + 1}`}
                  width={1024}
                  height={1024}
                  className="h-auto w-full rounded-xl"
                />
                <button
                  type="button"
                  className="mt-2 w-full rounded-full bg-blue-600 px-3 py-2 text-xs font-medium text-white"
                  onClick={() => downloadFromUrl(item.url, timestampName(`ai-image-${index + 1}`, "png"))}
                >
                  下载这张
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {role !== "super_admin" ? (
        <form action={submitCreditApplication} className="space-y-3 rounded-3xl bg-white p-4">
          <div className="text-sm font-medium text-slate-800">额度申请</div>
          <input name="requestedCredits" type="number" min="1" placeholder="申请额度，例如 20" />
          <textarea
            name="reason"
            rows={3}
            className="w-full rounded-2xl border border-[var(--line)] px-4 py-3"
            placeholder="请填写申请用途"
          />
          <button type="submit" className="w-full rounded-full border border-[var(--line)] px-4 py-3 text-sm font-medium text-slate-700">
            提交额度申请
          </button>
        </form>
      ) : null}
    </div>
  );
}
