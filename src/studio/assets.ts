/* ══════════════════════════════════════════════════════════════════════
   Görsel önbelleği
   html-to-image, DOM'u klonlarken <img>'leri yeniden fetch eder ve bu
   yarış siyah/boş kareler doğurur. Çözüm: tüm görselleri data-URI'ye çevir.
   ══════════════════════════════════════════════════════════════════════ */
const cache: Record<string, string> = {};

/**
 * Mutlak public yollarını (ör. "/mockup.png") Vite base'i ile önekle.
 * Böylece GitHub Pages'te (base "/SStore/") görseller doğru adresten yüklenir.
 * data:/http(s): kaynaklar ve önbellek anahtarları ise ham kalır.
 */
function withBase(src: string): string {
  if (!src || src.startsWith("data:") || /^https?:\/\//.test(src)) return src;
  return src.startsWith("/") ? import.meta.env.BASE_URL + src.slice(1) : src;
}

/** Bir kaynağı data-URI'ye çevirip önbelleğe al */
export async function preload(src: string): Promise<void> {
  if (!src || cache[src] || src.startsWith("data:")) return;
  const resp = await fetch(withBase(src));
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

/** Önbellekteki data-URI'yi döndür; yoksa base ile düzeltilmiş yolu döndür */
export function resolveImg(src: string): string {
  return cache[src] || withBase(src);
}
