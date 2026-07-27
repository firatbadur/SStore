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

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const bin = atob(dataUrl.split(",")[1]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

/* ─── ZIP (bağımlılıksız, "store" — sıkıştırma yok; PNG zaten sıkışık) ─── */
function crc32(buf: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function concatBytes(arrs: Uint8Array[]): Uint8Array {
  let len = 0;
  for (const a of arrs) len += a.length;
  const out = new Uint8Array(len);
  let o = 0;
  for (const a of arrs) {
    out.set(a, o);
    o += a.length;
  }
  return out;
}

/** Dosyaları tek bir .zip Blob'una paketle (klasörler dosya adındaki / ile) */
export function makeZip(files: { name: string; data: Uint8Array }[]): Blob {
  const enc = new TextEncoder();
  const u16 = (n: number) => Uint8Array.of(n & 255, (n >>> 8) & 255);
  const u32 = (n: number) => Uint8Array.of(n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255);

  const local: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const f of files) {
    const name = enc.encode(f.name);
    const crc = crc32(f.data);
    const n = f.data.length;
    const lfh = concatBytes([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(n), u32(n), u16(name.length), u16(0),
    ]);
    local.push(lfh, name, f.data);
    central.push(
      concatBytes([
        u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
        u32(crc), u32(n), u32(n), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset),
      ]),
      name,
    );
    offset += lfh.length + name.length + n;
  }
  const cdSize = central.reduce((s, a) => s + a.length, 0);
  const eocd = concatBytes([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cdSize), u32(offset), u16(0),
  ]);
  return new Blob([...local, ...central, eocd] as BlobPart[], { type: "application/zip" });
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
