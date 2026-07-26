import { Button } from "@/components/ui/button";
import {
  exportChartImage,
  type ImageFormat,
} from "@/components/charts/export-chart-image";
import { backgroundClass, type ChartBackgroundId } from "@/components/charts/studio";
import { cn } from "@/lib/utils";
import { useRef, useState, type ReactNode } from "react";

type ChartShellProps = {
  title?: string;
  children: ReactNode;
  filenameBase?: string;
  background?: ChartBackgroundId;
};

export function ChartShell({
  title,
  children,
  filenameBase = "funds-chart",
  background = "black",
}: ChartShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  function onExport(format: ImageFormat) {
    const stamp = new Date().toISOString().slice(0, 10);
    const fill =
      background === "transparent"
        ? null
        : background === "white"
          ? "#ffffff"
          : background === "paper"
            ? "#f0ebe3"
            : "#000000";
    const ok = exportChartImage(
      ref.current,
      `${filenameBase}-${stamp}.${format === "jpeg" ? "jpg" : format}`,
      format,
      fill,
    );
    setMessage(ok ? `Saved ${format.toUpperCase()}.` : "Could not export.");
    window.setTimeout(() => setMessage(null), 2500);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {title ? <h2 className="font-display text-xl">{title}</h2> : <span />}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onExport("png")}>
            Export PNG
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onExport("jpeg")}>
            Export JPG
          </Button>
        </div>
      </div>
      <div
        ref={ref}
        className={cn(
          "chart-export-root min-h-72 w-full overflow-hidden rounded-2xl border border-white/15 p-4 sm:p-6",
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
