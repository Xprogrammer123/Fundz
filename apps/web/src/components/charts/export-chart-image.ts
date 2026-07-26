import * as echarts from "echarts/core";
import { toJpeg, toPng } from "html-to-image";

export type ImageFormat = "png" | "jpeg" | "webp";

const EXPORT_DPR = 3;

function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function mimeFor(format: ImageFormat): string {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  return "image/png";
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/**
 * Redraw every ECharts instance inside root at a higher devicePixelRatio so
 * the canvas bitmap matches the export scale (avoids soft/upscaled bars).
 */
function boostChartDpr(root: HTMLElement, dpr: number): Array<() => void> {
  const restores: Array<() => void> = [];
  const seen = new Set<object>();

  root.querySelectorAll("canvas").forEach((canvas) => {
    let el: HTMLElement | null = canvas.parentElement;
    while (el && el !== root.parentElement) {
      const chart = echarts.getInstanceByDom(el);
      if (chart && !seen.has(chart)) {
        seen.add(chart);
        const painter = chart.getZr().painter as unknown as {
          dpr: number;
          resize: (opts?: { devicePixelRatio?: number }) => void;
        };
        const prev = painter.dpr ?? (window.devicePixelRatio || 1);
        painter.dpr = dpr;
        try {
          painter.resize({ devicePixelRatio: dpr });
        } catch {
          /* ignore */
        }
        chart.resize();
        restores.push(() => {
          painter.dpr = prev;
          try {
            painter.resize({ devicePixelRatio: prev });
          } catch {
            /* ignore */
          }
          chart.resize();
        });
      }
      el = el.parentElement;
    }
  });

  return restores;
}

/**
 * Export metrics + chart as a flat, edge-to-edge image (no card chrome).
 * Capture is local; nothing is uploaded.
 */
export async function exportChartImage(
  container: HTMLElement | null,
  filename: string,
  format: ImageFormat = "png",
  background: string | null = "#000000",
): Promise<boolean> {
  if (!container) return false;

  const fill =
    format === "jpeg" && (background === null || background === "transparent")
      ? "#000000"
      : background === "transparent"
        ? null
        : background;

  const styleBackup = container.style.cssText;
  const hideBackups: Array<{ el: HTMLElement; cssText: string }> = [];
  let restoreCharts: Array<() => void> = [];

  // Strip UI chrome — export should be flat content, not a framed screenshot.
  container.style.setProperty("border", "0", "important");
  container.style.setProperty("border-radius", "0", "important");
  container.style.setProperty("box-shadow", "none", "important");
  container.style.setProperty("outline", "none", "important");
  container.style.overflow = "hidden";

  container
    .querySelectorAll<HTMLElement>("[class*='tooltip'], .echarts-tooltip")
    .forEach((el) => {
      hideBackups.push({ el, cssText: el.style.cssText });
      el.style.visibility = "hidden";
    });

  try {
    restoreCharts = boostChartDpr(container, EXPORT_DPR);
    await nextFrame();

    const w = Math.ceil(container.getBoundingClientRect().width);
    const h = Math.ceil(container.getBoundingClientRect().height);

    const options = {
      cacheBust: true,
      pixelRatio: EXPORT_DPR,
      backgroundColor: fill ?? undefined,
      width: w,
      height: h,
      style: {
        border: "0",
        borderRadius: "0",
        boxShadow: "none",
        outline: "none",
        margin: "0",
        transform: "scale(1)",
        transformOrigin: "top left",
      },
    };

    let dataUrl: string;
    if (format === "jpeg") {
      dataUrl = await toJpeg(container, { ...options, quality: 1 });
    } else {
      dataUrl = await toPng(container, options);
      if (format === "webp") {
        dataUrl = await canvasTranscode(dataUrl, "image/webp", fill);
      }
    }

    downloadDataUrl(dataUrl, filename);
    return true;
  } catch {
    return exportCanvasFallback(container, filename, format, fill);
  } finally {
    container.style.cssText = styleBackup;
    for (const { el, cssText } of hideBackups) el.style.cssText = cssText;
    for (const restore of restoreCharts) restore();
  }
}

async function canvasTranscode(
  pngDataUrl: string,
  mime: string,
  fill: string | null,
): Promise<string> {
  const img = await loadImage(pngDataUrl);
  const out = document.createElement("canvas");
  out.width = img.naturalWidth;
  out.height = img.naturalHeight;
  const ctx = out.getContext("2d");
  if (!ctx) return pngDataUrl;
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, out.width, out.height);
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);
  return out.toDataURL(mime, 0.95);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function exportCanvasFallback(
  container: HTMLElement,
  filename: string,
  format: ImageFormat,
  fill: string | null,
): boolean {
  const canvas = container.querySelector("canvas");
  if (!canvas) return false;
  const mime = mimeFor(format === "webp" ? "png" : format);

  try {
    const out = document.createElement("canvas");
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext("2d");
    if (!ctx) return false;
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, out.width, out.height);
    }
    ctx.drawImage(canvas, 0, 0);
    downloadDataUrl(out.toDataURL(mime, format === "jpeg" ? 0.95 : undefined), filename);
    return true;
  } catch {
    return false;
  }
}
