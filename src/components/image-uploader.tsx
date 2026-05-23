"use client";

import { useRef } from "react";

type Props = {
  label: string;
  accept?: string;
  multiple?: boolean;
  onFiles: (files: FileList) => void;
  hint?: string;
};

export function ImageUploader({
  label,
  accept = "image/*",
  multiple,
  onFiles,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-3xl border border-dashed border-[var(--line)] bg-slate-50 p-4 text-center">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) {
            onFiles(event.target.files);
            event.target.value = "";
          }
        }}
      />
      <p className="text-sm font-medium text-slate-900">{label}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
        {hint ?? "支持 JPG、PNG、WebP"}
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        选择图片
      </button>
    </div>
  );
}
