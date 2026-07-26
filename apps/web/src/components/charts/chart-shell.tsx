import { Button } from "@/components/ui/button";
import {
  exportChartImage,
  type ImageFormat,
} from "@/components/charts/export-chart-image";
import {
  backgroundClass,
  backgroundFill,
  type ChartBackgroundId,
} from "@/components/charts/studio";
import { cn } from "@/lib/utils";
import { useRef, useState, type ReactNode } from "react";

type ChartShellProps = {
  title?: string;
  children: ReactNode;
  filenameBase?: string;
  background?: ChartBackgroundId;
  /** Force remount when look changes so ECharts re-reads theme colors */
  remountKey?: string;
};

export function ChartShell({
  title,
  children,
  filenameBase = "funds-chart",
  background = "black",
  remountKey,
}: ChartShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onExport(format: ImageFormat) {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    const stamp = new Date().toISOString().slice(0, 10);
    try {
      const ok = await exportChartImage(
        ref.current,
        `${filenameBase}-${stamp}.${format === "jpeg" ? "jpg" : format}`,
        format,
        backgroundFill(background),
      );
      setMessage(ok ? `Exported ${format.toUpperCase()}.` : "Could not export.");
    } finally {
      setBusy(false);
      window.setTimeout(() => setMessage(null), 2500);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {title ? <h2 className="font-display text-xl text-ink">{title}</h2> : <span />}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void onExport("png")}
          >
            {busy ? "Exporting…" : "Export PNG"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void onExport("jpeg")}
          >
            Export JPG
          </Button>
        </div>
      </div>
      <div
        key={remountKey ?? background}
        ref={ref}
        className={cn(
          "chart-export-root min-h-72 w-full overflow-hidden rounded-2xl border p-4 sm:p-6",
          backgroundClass(background),
        )}
      >
        {children}
      </div>
      {message ? (
        <p className="font-hand text-sm text-ink-soft" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
