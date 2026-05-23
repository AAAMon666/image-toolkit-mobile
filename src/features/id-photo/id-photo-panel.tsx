"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ImageUploader } from "@/components/image-uploader";
import { ResultActions } from "@/components/result-actions";
import { renderIdPhoto } from "@/lib/image/id-photo";
import { idPhotoPresets } from "@/lib/image/id-photo-presets";
import { downloadBlob, formatDimensions, timestampName } from "@/lib/image/shared";

export function IdPhotoPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [presetId, setPresetId] = useState(idPhotoPresets[0].id);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [result, setResult] = useState<{
    blob: Blob;
    width: number;
    height: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preset = useMemo(
    () => idPhotoPresets.find((item) => item.id === presetId) ?? idPhotoPresets[0],
    [presetId],
  );

  const previewUrl = useMemo(() => {
    return result ? URL.createObjectURL(result.blob) : null;
  }, [result]);

  async function handleRender() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const next = await renderIdPhoto(file, preset, {
        scale,
        offsetX,
        offsetY,
      });
      setResult(next);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <ImageUploader
        label={file ? `当前图片：${file.name}` : "上传人物照片"}
        onFiles={(files) => {
          setFile(files[0] ?? null);
          setResult(null);
          setError(null);
        }}
        hint="根据目标尺寸比例做 cover 裁切，不留白，不换底色"
      />

      <div className="space-y-4 rounded-3xl bg-white p-4">
        <div>
          <label className="mb-2 block text-sm font-medium">证件照尺寸</label>
          <select value={presetId} onChange={(event) => setPresetId(event.target.value)}>
            {idPhotoPresets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>缩放</span>
            <span>{scale.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="2.5"
            step="0.01"
            value={scale}
            onChange={(event) => setScale(Number(event.target.value))}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">水平偏移</label>
          <select value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))}>
            <option value={-80}>向左</option>
            <option value={-40}>微左</option>
            <option value={0}>居中</option>
            <option value={40}>微右</option>
            <option value={80}>向右</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">垂直偏移</label>
          <select value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))}>
            <option value={-120}>向上</option>
            <option value={-60}>微上</option>
            <option value={0}>居中</option>
            <option value={60}>微下</option>
            <option value={120}>向下</option>
          </select>
        </div>

        <button
          type="button"
          disabled={!file || loading}
          onClick={handleRender}
          className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:bg-slate-300"
        >
          {loading ? "生成中..." : "生成证件照"}
        </button>
      </div>

      <div className="space-y-3 rounded-3xl bg-white p-4 text-sm text-slate-700">
        <div>当前比例：{formatDimensions(preset.width, preset.height)}</div>
        {previewUrl ? (
          <div className="rounded-2xl border border-[var(--line)] bg-slate-50 p-3">
            <div className="mb-2 text-sm font-medium text-slate-800">证件照预览</div>
            <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-4">
              <div
                className="w-full max-w-40 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                style={{ aspectRatio: `${preset.width} / ${preset.height}` }}
              >
                <Image
                  unoptimized
                  src={previewUrl}
                  alt="证件照预览"
                  width={result?.width ?? preset.width}
                  height={result?.height ?? preset.height}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <ResultActions
        canDownload={!!result}
        onDownload={() => {
          if (!result) return;
          downloadBlob(result.blob, timestampName("id-photo", "jpg"));
        }}
        onReset={() => {
          setFile(null);
          setResult(null);
          setError(null);
          setScale(1);
          setOffsetX(0);
          setOffsetY(0);
          setPresetId(idPhotoPresets[0].id);
        }}
      />
    </div>
  );
}
