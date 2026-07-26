export type ImageFormat = "png" | "jpeg" | "webp";

function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/**
 * Export the first canvas inside a chart container as an image.
 * EvilCharts (ECharts) renders to canvas — no upload, all local.
 */
export function exportChartImage(
  container: HTMLElement | null,
  filename: string,
  format: ImageFormat = "png",
  pixelRatio = 2,
): boolean {
  if (!container) return false;
  const canvas = container.querySelector("canvas");
  if (!canvas) return false;

  const mime =
    format === "jpeg"
      ? "image/jpeg"
      : format === "webp"
        ? "image/webp"
        : "image/png";

  try {
    // Upscale via offscreen canvas for sharper exports
    const out = document.createElement("canvas");
    out.width = canvas.width * (pixelRatio > 1 ? 1 : 1);
    out.height = canvas.height;
    // Prefer the chart canvas's native resolution (already DPR-aware)
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext("2d");
    if (!ctx) return false;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);
    const dataUrl = out.toDataURL(mime, format === "jpeg" ? 0.92 : undefined);
    downloadDataUrl(dataUrl, filename);
    return true;
  } catch {
    // Fallback if tainted (shouldn't happen for local canvas)
    try {
      downloadDataUrl(canvas.toDataURL(mime), filename);
      return true;
    } catch {
      return false;
    }
  }
}
