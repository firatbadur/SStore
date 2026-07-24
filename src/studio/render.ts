/* ══════════════════════════════════════════════════════════════════════
   Üretim & dışa aktarma
   - captureNode: DOM'u tam çözünürlükte PNG'ye çevir (html-to-image)
   - downscale: hedef export boyutuna ölçekle
   - indir / klasöre kaydet (File System Access API) / zip
   ══════════════════════════════════════════════════════════════════════ */
import { toPng } from "html-to-image";

/** Tam çözünürlük yakalama — iki geçiş (fontlar/görseller ısınır, sonra temiz çıktı) */
export async function captureNode(el: HTMLElement, designW: number, designH: number): Promise<string> {
  const opts = { width: designW, height: designH, pixelRatio: 1, cacheBust: true };
  await toPng(el, opts);
  return toPng(el, opts);
}

/** Bir PNG data-URL'ini hedef boyuta ölçekle */
export async function downscale(dataUrl: string, w: number, h: number, srcW: number, srcH: number): Promise<string> {
  if (w === srcW && h === srcH) return dataUrl;
  const im = new Image();
  await new Promise<void>((resolve, reject) => {
    im.onload = () => resolve();
    im.onerror = reject;
    im.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(im, 0, 0, w, h);
  return canvas.toDataURL("image/png");
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(body);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/* ─── File System Access API (klasör seçimi) ─── */
export function fsSupported(): boolean {
  return typeof (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker === "function";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function pickDirectory(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle: FileSystemDirectoryHandle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
    return handle;
  } catch {
    return null; // kullanıcı iptal etti
  }
}

/** dir/alt-klasör/dosya.png yaz */
export async function writeFile(dir: FileSystemDirectoryHandle, subdir: string, filename: string, blob: Blob) {
  let target: any = dir;
  if (subdir) {
    target = await (dir as any).getDirectoryHandle(subdir, { create: true });
  }
  const fileHandle = await target.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}
