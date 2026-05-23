"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/image-uploader";
import { ResultActions } from "@/components/result-actions";
import { compressImage } from "@/lib/image/compress";
import {
  downloadBlob,
  formatDimensions,
  formatFileSize,
  timestampName,
} from "@/lib/image/shared";

export function CompressPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(82);
  const [maxWidth, setMaxWidth] = useState(1080);
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [result, setResult] = useState<{
    blob: Blob;
    width: number;
    height: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const before = file ? formatFileSize(file.size) : "-";
  const after = result ? formatFileSize(result.blob.size) : "-";

  async function handleCompress() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const compressed = await compressImage(file, {
        maxWidth,
        quality: quality / 100,
        mimeType: format,
      });
      setResult(compressed);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "压缩失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <ImageUploader
        label={file ? `当前文件：${file.name}` : "上传一张需要压缩的图片"}
        onFiles={(files) => {
          setFile(files[0] ?? null);
          setResult(null);
          setError(null);
        }}
        hint="单图压缩，适合发朋友圈、表单上传、网页分享"
      />

      <div className="space-y-4 rounded-3xl bg-white p-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>输出宽度</span>
            <span>{maxWidth}px</span>
          </div>
          <input
            type="range"
            min="480"
            max="2160"
            step="60"
            value={maxWidth}
            onChange={(event) => setMaxWidth(Number(event.target.value))}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>压缩质量</span>
            <span>{quality}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="100"
            step="1"
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">输出格式</label>
          <select value={format} onChange={(event) => setFormat(event.target.value as typeof format)}>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>

        <button
          type="button"
          disabled={!file || loading}
          onClick={handleCompress}
          className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:bg-slate-300"
        >
          {loading ? "压缩中..." : "开始压缩"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-3xl bg-white p-4">
          <p className="text-[var(--muted)]">压缩前</p>
          <p className="mt-2 text-lg font-semibold">{before}</p>
        </div>
        <div className="rounded-3xl bg-white p-4">
          <p className="text-[var(--muted)]">压缩后</p>
          <p className="mt-2 text-lg font-semibold">{after}</p>
        </div>
      </div>

      {result ? (
        <div className="rounded-3xl bg-white p-4 text-sm text-slate-700">
          结果尺寸：{formatDimensions(result.width, result.height)}
        </div>
      ) : null}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <ResultActions
        canDownload={!!result}
        onDownload={() => {
          if (!result) return;
          downloadBlob(
            result.blob,
            timestampName("compressed", format === "image/jpeg" ? "jpg" : "webp"),
          );
        }}
        onReset={() => {
          setFile(null);
          setResult(null);
          setError(null);
        }}
      />
    </div>
  );
}
