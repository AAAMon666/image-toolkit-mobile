export function ResultActions({
  canDownload,
  onDownload,
  onReset,
}: {
  canDownload: boolean;
  onDownload: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        disabled={!canDownload}
        onClick={onDownload}
        className="flex-1 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        下载结果
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-[var(--line)] px-4 py-3 text-sm font-medium text-slate-700"
      >
        重置
      </button>
    </div>
  );
}
