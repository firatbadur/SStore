/* ══════════════════════════════════════════════════════════════════════
   Görsel önbelleği
   html-to-image, DOM'u klonlarken <img>'leri yeniden fetch eder ve bu
   yarış siyah/boş kareler doğurur. Çözüm: tüm görselleri data-URI'ye çevir.
   ══════════════════════════════════════════════════════════════════════ */
const cache: Record<string, string> = {};

/** Bir kaynağı data-URI'ye çevirip önbelleğe al */
export async function preload(src: string): Promise<void> {
  if (!src || cache[src] || src.startsWith("data:")) return;
  const resp = await fetch(src);
  const blob = await resp.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  cache[src] = dataUrl;
}

export async function preloadAll(srcs: string[]): Promise<void> {
  await Promise.all([...new Set(srcs.filter(Boolean))].map(preload));
}

/** Önbellekteki data-URI'yi döndür; yoksa (ör. yüklenen data URL) olduğu gibi */
export function resolveImg(src: string): string {
  return cache[src] || src;
}
