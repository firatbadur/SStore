/* ══════════════════════════════════════════════════════════════════════
   Tema / Yüzey sistemi
   Bir tema; "main / contrast / brand" yüzeylerini üretir. Her slayt bir
   yüzey ister → temayı değiştirince tüm set ruhu korunarak döner.
   ══════════════════════════════════════════════════════════════════════ */
import type { BackgroundConfig, FontId, ThemeId, ToneId } from "./types";

export interface Surface {
  bg: string;
  ink: string;
  sub: string;
  accent: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  cardInk: string;
  cardSub: string;
  pillBg: string;
  pillBorder: string;
  pillInk: string;
  glow: string | null;
  dots: string;
}

export const BRAND = {
  blue: "#2B6CB0",
  blueLt: "#5B9BD5",
  blueDp: "#1A3A6A",
  ink: "#0C1220",
};

const S_LIGHT: Surface = {
  bg: "radial-gradient(125% 120% at 50% -15%, #FFFFFF 0%, #F5F3EE 52%, #ECE8E0 100%)",
  ink: "#14181F",
  sub: "#6B7280",
  accent: BRAND.blue,
  cardBg: "#FFFFFF",
  cardBorder: "rgba(18,24,34,0.07)",
  cardShadow: "0 34px 70px -26px rgba(20,28,45,0.28), 0 6px 18px -8px rgba(20,28,45,0.12)",
  cardInk: "#14181F",
  cardSub: "#7A8494",
  pillBg: "#FFFFFF",
  pillBorder: "rgba(18,24,34,0.06)",
  pillInk: "#1B2330",
  glow: "radial-gradient(60% 45% at 78% 22%, rgba(43,108,176,0.14) 0%, rgba(43,108,176,0) 70%)",
  dots: "rgba(20,28,45,0.05)",
};

const S_DARK: Surface = {
  bg: "radial-gradient(130% 120% at 50% -12%, #16233A 0%, #0C1220 55%, #080B14 100%)",
  ink: "#F4F7FB",
  sub: "rgba(233,240,250,0.62)",
  accent: BRAND.blueLt,
  cardBg: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.12)",
  cardShadow: "0 34px 70px -26px rgba(0,0,0,0.6)",
  cardInk: "#F4F7FB",
  cardSub: "rgba(233,240,250,0.6)",
  pillBg: "rgba(255,255,255,0.08)",
  pillBorder: "rgba(255,255,255,0.14)",
  pillInk: "#EAF1FB",
  glow: "radial-gradient(55% 40% at 76% 20%, rgba(91,155,213,0.22) 0%, rgba(91,155,213,0) 70%)",
  dots: "rgba(255,255,255,0.045)",
};

const S_BRAND: Surface = {
  bg: "linear-gradient(158deg, #2E74BC 0%, #245D9C 42%, #17406F 100%)",
  ink: "#FFFFFF",
  sub: "rgba(255,255,255,0.80)",
  accent: "#DCEBFB",
  cardBg: "#FFFFFF",
  cardBorder: "rgba(255,255,255,0.5)",
  cardShadow: "0 40px 80px -28px rgba(6,24,48,0.55)",
  cardInk: "#14181F",
  cardSub: "#5B6675",
  pillBg: "rgba(255,255,255,0.16)",
  pillBorder: "rgba(255,255,255,0.28)",
  pillInk: "#FFFFFF",
  glow: "radial-gradient(60% 50% at 20% 12%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)",
  dots: "rgba(255,255,255,0.06)",
};

/* ─── Yüzey fabrikaları (yeni temalar için tekrarı azaltır) ─── */
interface SurfOpts {
  bg: string;
  accent: string;
  glow?: string;
  dots?: string;
}

function lightSurface({ bg, accent, glow, dots }: SurfOpts): Surface {
  return { ...S_LIGHT, bg, accent, glow: glow ?? S_LIGHT.glow, dots: dots ?? S_LIGHT.dots };
}
function darkSurface({ bg, accent, glow, dots }: SurfOpts): Surface {
  return { ...S_DARK, bg, accent, glow: glow ?? S_DARK.glow, dots: dots ?? S_DARK.dots };
}
function brandSurface({ bg, accent, glow, dots }: SurfOpts): Surface {
  return { ...S_BRAND, bg, accent, glow: glow ?? S_BRAND.glow, dots: dots ?? S_BRAND.dots };
}

/* Gün Batımı — sıcak */
const SUNSET_MAIN = lightSurface({ bg: "radial-gradient(125% 120% at 50% -15%, #FFF7F0 0%, #FDE9DC 55%, #F6D8C6 100%)", accent: "#F97316", glow: "radial-gradient(60% 45% at 78% 22%, rgba(249,115,22,0.16) 0%, rgba(249,115,22,0) 70%)", dots: "rgba(120,60,20,0.05)" });
const SUNSET_DARK = darkSurface({ bg: "radial-gradient(130% 120% at 50% -12%, #3A241A 0%, #1F130C 55%, #140B06 100%)", accent: "#FDBA74", glow: "radial-gradient(55% 40% at 76% 20%, rgba(253,186,116,0.22) 0%, rgba(253,186,116,0) 70%)" });
const SUNSET_BRAND = brandSurface({ bg: "linear-gradient(155deg, #FB7185 0%, #F97316 55%, #EA580C 100%)", accent: "#FFE9D8" });

/* Zümrüt — yeşil */
const EMERALD_MAIN = lightSurface({ bg: "radial-gradient(125% 120% at 50% -15%, #F1FBF6 0%, #DFF3E9 55%, #CDEBDC 100%)", accent: "#059669", glow: "radial-gradient(60% 45% at 78% 22%, rgba(5,150,105,0.14) 0%, rgba(5,150,105,0) 70%)", dots: "rgba(6,60,40,0.05)" });
const EMERALD_DARK = darkSurface({ bg: "radial-gradient(130% 120% at 50% -12%, #123026 0%, #0A1A14 55%, #06110C 100%)", accent: "#34D399", glow: "radial-gradient(55% 40% at 76% 20%, rgba(52,211,153,0.2) 0%, rgba(52,211,153,0) 70%)" });
const EMERALD_BRAND = brandSurface({ bg: "linear-gradient(155deg, #10B981 0%, #059669 50%, #047857 100%)", accent: "#D7F5E7" });

/* Grafit — nötr koyu */
const GRAPHITE_MAIN = darkSurface({ bg: "radial-gradient(130% 120% at 50% -12%, #2A2E37 0%, #16181E 58%, #0D0F13 100%)", accent: "#C7CDD6", glow: "radial-gradient(55% 40% at 76% 20%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)" });
const GRAPHITE_LIGHT = lightSurface({ bg: "radial-gradient(125% 120% at 50% -15%, #FAFBFC 0%, #EEF0F3 55%, #E2E5EA 100%)", accent: "#3B4252" });
const GRAPHITE_BRAND = brandSurface({ bg: "linear-gradient(155deg, #4B5563 0%, #374151 50%, #1F2937 100%)", accent: "#E5E7EB" });

/* İnci — yumuşak sıcak açık */
const PEARL_MAIN = lightSurface({ bg: "radial-gradient(125% 120% at 50% -15%, #FFFFFF 0%, #F7F4F1 52%, #EFEAE4 100%)", accent: "#9C8B76", glow: "radial-gradient(60% 45% at 78% 22%, rgba(156,139,118,0.12) 0%, rgba(156,139,118,0) 70%)", dots: "rgba(80,70,55,0.045)" });

/* Menekşe — mor */
const VIOLET_MAIN = lightSurface({ bg: "radial-gradient(125% 120% at 50% -15%, #FAF7FF 0%, #EFE7FD 55%, #E3D6FB 100%)", accent: "#8B5CF6", glow: "radial-gradient(60% 45% at 78% 22%, rgba(139,92,246,0.16) 0%, rgba(139,92,246,0) 70%)", dots: "rgba(60,30,90,0.05)" });
const VIOLET_DARK = darkSurface({ bg: "radial-gradient(130% 120% at 50% -12%, #241A3D 0%, #140F24 55%, #0C0918 100%)", accent: "#A78BFA", glow: "radial-gradient(55% 40% at 76% 20%, rgba(167,139,250,0.24) 0%, rgba(167,139,250,0) 70%)" });
const VIOLET_BRAND = brandSurface({ bg: "linear-gradient(155deg, #A78BFA 0%, #8B5CF6 50%, #6D28D9 100%)", accent: "#EDE4FF" });

/* Okyanus — camgöbeği */
const OCEAN_MAIN = lightSurface({ bg: "radial-gradient(125% 120% at 50% -15%, #F0FBFF 0%, #DCF1F8 55%, #C7E7F2 100%)", accent: "#0EA5E9", glow: "radial-gradient(60% 45% at 78% 22%, rgba(14,165,233,0.15) 0%, rgba(14,165,233,0) 70%)", dots: "rgba(10,50,70,0.05)" });
const OCEAN_DARK = darkSurface({ bg: "radial-gradient(130% 120% at 50% -12%, #0D2A3A 0%, #081924 55%, #05121A 100%)", accent: "#38BDF8", glow: "radial-gradient(55% 40% at 76% 20%, rgba(56,189,248,0.22) 0%, rgba(56,189,248,0) 70%)" });
const OCEAN_BRAND = brandSurface({ bg: "linear-gradient(155deg, #22D3EE 0%, #0EA5E9 50%, #0369A1 100%)", accent: "#D6F1FB" });

/* Gül — pembe */
const ROSE_MAIN = lightSurface({ bg: "radial-gradient(125% 120% at 50% -15%, #FFF5F8 0%, #FDE4EC 55%, #F9D2E0 100%)", accent: "#E11D48", glow: "radial-gradient(60% 45% at 78% 22%, rgba(225,29,72,0.14) 0%, rgba(225,29,72,0) 70%)", dots: "rgba(90,20,40,0.05)" });
const ROSE_DARK = darkSurface({ bg: "radial-gradient(130% 120% at 50% -12%, #3A1522 0%, #240B12 55%, #170709 100%)", accent: "#FB7185", glow: "radial-gradient(55% 40% at 76% 20%, rgba(251,113,133,0.22) 0%, rgba(251,113,133,0) 70%)" });
const ROSE_BRAND = brandSurface({ bg: "linear-gradient(155deg, #FB7185 0%, #E11D48 50%, #BE123C 100%)", accent: "#FFDDE6" });

const MAP: Record<ThemeId, Record<ToneId, Surface>> = {
  editorial: { main: S_LIGHT, contrast: S_DARK, brand: S_BRAND },
  midnight: { main: S_DARK, contrast: S_LIGHT, brand: S_BRAND },
  brand: { main: S_BRAND, contrast: S_DARK, brand: S_BRAND },
  sunset: { main: SUNSET_MAIN, contrast: SUNSET_DARK, brand: SUNSET_BRAND },
  emerald: { main: EMERALD_MAIN, contrast: EMERALD_DARK, brand: EMERALD_BRAND },
  graphite: { main: GRAPHITE_MAIN, contrast: GRAPHITE_LIGHT, brand: GRAPHITE_BRAND },
  pearl: { main: PEARL_MAIN, contrast: S_DARK, brand: S_BRAND },
  violet: { main: VIOLET_MAIN, contrast: VIOLET_DARK, brand: VIOLET_BRAND },
  ocean: { main: OCEAN_MAIN, contrast: OCEAN_DARK, brand: OCEAN_BRAND },
  rose: { main: ROSE_MAIN, contrast: ROSE_DARK, brand: ROSE_BRAND },
};

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: "editorial", label: "Editoryal Açık" },
  { id: "midnight", label: "Gece" },
  { id: "brand", label: "Marka Mavi" },
  { id: "sunset", label: "Gün Batımı" },
  { id: "emerald", label: "Zümrüt" },
  { id: "graphite", label: "Grafit" },
  { id: "pearl", label: "İnci" },
  { id: "violet", label: "Menekşe" },
  { id: "ocean", label: "Okyanus" },
  { id: "rose", label: "Gül" },
];

/** Tema + ton → somut yüzey. accent override kicker/vurgu rengini değiştirir. */
export function surfaceOf(theme: ThemeId, tone: ToneId, accent?: string): Surface {
  const base = MAP[theme][tone];
  if (!accent || tone === "brand") return base;
  return { ...base, accent };
}

/** Özel arka planlarda metni okunaklı tutmak için ink/sub rengini zorla */
export function applyInk(s: Surface, ink: "light" | "dark"): Surface {
  if (ink === "light") return { ...s, ink: "#F6F9FE", sub: "rgba(240,245,252,0.72)" };
  return { ...s, ink: "#14181F", sub: "#5B6675" };
}

/** Özel arka planı CSS `background` shorthand'ine çevir. mode "theme" ise null. */
export function resolveBackground(bg: BackgroundConfig): string | null {
  if (bg.mode === "theme") return null;
  if (bg.mode === "solid") return bg.color1;
  if (bg.mode === "gradient") return `linear-gradient(${bg.angle}deg, ${bg.color1} 0%, ${bg.color2} 100%)`;
  if (bg.mode === "image" && bg.image) {
    const scrim = bg.scrim > 0 ? `linear-gradient(rgba(8,11,20,${bg.scrim}), rgba(8,11,20,${bg.scrim})), ` : "";
    return `${scrim}url("${bg.image}") center / ${bg.imageFit} no-repeat`;
  }
  return null;
}

/* ─── Fontlar ─── */
export const FONTS: { id: FontId; label: string; stack: string }[] = [
  { id: "jakarta", label: "Plus Jakarta Sans", stack: "'Plus Jakarta Sans', sans-serif" },
  { id: "grotesk", label: "Space Grotesk", stack: "'Space Grotesk', sans-serif" },
  { id: "sora", label: "Sora", stack: "'Sora', sans-serif" },
  { id: "manrope", label: "Manrope", stack: "'Manrope', sans-serif" },
  { id: "bricolage", label: "Bricolage Grotesque", stack: "'Bricolage Grotesque', sans-serif" },
  { id: "archivo", label: "Archivo", stack: "'Archivo', sans-serif" },
  { id: "inter", label: "Inter", stack: "'Inter', sans-serif" },
];

export function fontStack(id: FontId): string {
  return FONTS.find((f) => f.id === id)?.stack ?? FONTS[0].stack;
}

/* ─── Vurgu rengi seçenekleri ─── */
export const ACCENTS = ["#2B6CB0", "#5B9BD5", "#0EA5E9", "#6366F1", "#8B5CF6", "#059669", "#F97316", "#E11D48"];
