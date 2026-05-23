"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ImageUploader } from "@/components/image-uploader";
import { ResultActions } from "@/components/result-actions";
import { stitchImages } from "@/lib/image/stitch";
import {
  downloadBlob,
  formatDimensions,
  timestampName,
} from "@/lib/image/shared";

type StitchItem = {
  id: string;
  file: File;
};

export function StitchPanel() {
  const [items, setItems] = useState<StitchItem[]>([]);
  const [targetWidth, setTargetWidth] = useState(1080);
  const [gap, setGap] = useState(0);
  const [result, setResult] = useState<{
    blob: Blob;
    width: number;
    height: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    return result ? URL.createObjectURL(result.blob) : null;
  }, [result]);

  async function handleStitch() {
    if (!items.length) return;
    setLoading(true);
    setError(null);
    try {
      const stitched = await stitchImages(items, {
        targetWidth,
        gap,
        background: "#ffffff",
      });
      setResult(stitched);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "拼接失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <ImageUploader
        label={items.length ? `已选 ${items.length} 张图片` : "上传多张图片拼成长图"}
        multiple
        onFiles={(files) => {
          setItems(
            Array.from(files).map((file, index) => ({
              id: `${file.name}-${index}-${crypto.randomUUID()}`,
              file,
            })),
          );
          setResult(null);
          setError(null);
        }}
        hint="横图、竖图、方图都可以，系统会按统一宽度等比拼接"
      />

      {items.length ? (
        <div className="space-y-3 rounded-3xl bg-white p-4">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>图片顺序</span>
            <span className="text-[var(--muted)]">可上下调整</span>
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 rounded-2xl border border-[var(--line)] px-3 py-2">
                <div className="min-w-0 flex-1 text-sm">
                  <div className="truncate font-medium text-slate-800">{item.file.name}</div>
                  <div className="text-xs text-[var(--muted)]">第 {index + 1} 张</div>
                </div>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    if (index === 0) return;
                    const next = [...items];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    setItems(next);
                  }}
                  className="rounded-full border border-[var(--line)] px-3 py-1 text-xs disabled:opacity-40"
                >
                  上移
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => {
                    if (index === items.length - 1) return;
                    const next = [...items];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    setItems(next);
                  }}
                  className="rounded-full border border-[var(--line)] px-3 py-1 text-xs disabled:opacity-40"
                >
                  下移
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-4 rounded-3xl bg-white p-4">
        <div>
          <label className="mb-2 block text-sm font-medium">目标拼接宽度</label>
          <select value={targetWidth} onChange={(event) => setTargetWidth(Number(event.target.value))}>
            <option value={720}>720 px</option>
            <option value={1080}>1080 px</option>
            <option value={1440}>1440 px</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">图片间距</label>
          <select value={gap} onChange={(event) => setGap(Number(event.target.value))}>
            <option value={0}>0 px</option>
            <option value={8}>8 px</option>
            <option value={16}>16 px</option>
            <option value={24}>24 px</option>
          </select>
        </div>
        <button
          type="button"
          disabled={!items.length || loading}
          onClick={handleStitch}
          className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:bg-slate-300"
        >
          {loading ? "拼接中..." : "生成长图"}
        </button>
      </div>

      {result ? (
        <div className="space-y-3 rounded-3xl bg-white p-4 text-sm text-slate-700">
          <div>输出尺寸：{formatDimensions(result.width, result.height)}</div>
          {previewUrl ? (
            <div className="rounded-2xl border border-[var(--line)] bg-slate-50 p-3">
              <div className="mb-2 text-sm font-medium text-slate-800">长图预览</div>
              <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                <Image
                  unoptimized
                  src={previewUrl}
                  alt="长图预览"
                  width={result.width}
                  height={result.height}
                  className="h-auto w-full rounded-lg"
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <ResultActions
        canDownload={!!result}
        onDownload={() => {
          if (!result) return;
          downloadBlob(result.blob, timestampName("stitched", "png"));
        }}
        onReset={() => {
          setItems([]);
          setResult(null);
          setError(null);
        }}
      />
    </div>
  );
}
