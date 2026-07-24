/* ══════════════════════════════════════════════════════════════════════
   Tema / Yüzey sistemi
   Bir tema; "main / contrast / brand" yüzeylerini üretir. Her slayt bir
   yüzey ister → temayı değiştirince tüm set ruhu korunarak döner.
   ══════════════════════════════════════════════════════════════════════ */
import type { FontId, ThemeId, ToneId } from "./types";

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

const MAP: Record<ThemeId, Record<ToneId, Surface>> = {
  editorial: { main: S_LIGHT, contrast: S_DARK, brand: S_BRAND },
  midnight: { main: S_DARK, contrast: S_LIGHT, brand: S_BRAND },
  brand: { main: S_BRAND, contrast: S_DARK, brand: S_BRAND },
};

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: "editorial", label: "Editoryal Açık" },
  { id: "midnight", label: "Gece" },
  { id: "brand", label: "Marka Mavi" },
];

/** Tema + ton → somut yüzey. accent override kicker/vurgu rengini değiştirir. */
export function surfaceOf(theme: ThemeId, tone: ToneId, accent?: string): Surface {
  const base = MAP[theme][tone];
  if (!accent || tone === "brand") return base;
  return { ...base, accent };
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
