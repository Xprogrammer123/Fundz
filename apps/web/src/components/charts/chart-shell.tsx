import { Button } from "@/components/ui/button";
import {
  exportChartImage,
  type ImageFormat,
} from "@/components/charts/export-chart-image";
import { useRef, useState, type ReactNode } from "react";

type ChartShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  filenameBase?: string;
};

export function ChartShell({
  title,
  subtitle,
  children,
  filenameBase = "funds-chart",
}: ChartShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  function onExport(format: ImageFormat) {
    const stamp = new Date().toISOString().slice(0, 10);
    const ok = exportChartImage(
      ref.current,
      `${filenameBase}-${stamp}.${format === "jpeg" ? "jpg" : format}`,
      format,
    );
    setMessage(ok ? `Saved ${format.toUpperCase()} locally.` : "Could not export chart.");
    window.setTimeout(() => setMessage(null), 2500);
  }

  return (
    <section className="panel p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-xl">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onExport("png")}>
            Export PNG
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onExport("jpeg")}>
            Export JPG
          </Button>
        </div>
      </div>
      <div ref={ref} className="chart-export-root min-h-72 w-full">
        {children}
      </div>
      {message ? (
        <p className="font-hand mt-3 text-sm text-ink-soft" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
