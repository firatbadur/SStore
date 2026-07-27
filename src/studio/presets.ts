/* ══════════════════════════════════════════════════════════════════════
   Slayt tipi + varsayılan stil config'i
   Uygulama boş başlar: kullanıcı kendi ekran görüntülerini yükleyip
   metin/yerleşim/tasarımı düzenler. Gömülü hazır set yoktur.
   ══════════════════════════════════════════════════════════════════════ */
import type { SlideSpec, StyleConfig } from "./types";
import type { FloatSpec } from "./slides";

/** Bir slayt: ekran görüntüsü + metin/yerleşim + isteğe bağlı yüzen öğeler */
export type BuiltinSlide = SlideSpec & { floats?: FloatSpec[] };

export const DEFAULT_CONFIG: StyleConfig = {
  theme: "editorial",
  font: "jakarta",
  accent: "#2B6CB0",
  tilt: 0, // düz telefon (kullanıcı tercihi)
  phoneScale: 1,
  shadow: true,
  floats: true,
  texture: true,
  align: "center",
  shotAnchor: "bottom", // ekran görüntüsü altta, metin üstte
  background: {
    mode: "theme", // temanın kendi zemini
    color1: "#F5F3EE",
    color2: "#2B6CB0",
    angle: 158,
    imageFit: "cover",
    scrim: 0.28,
    ink: "auto",
  },
  featureGraphic: {
    title: "", // boş → proje adı
    tagline: "",
    kicker: "",
    showPhone: true,
    shotSlideId: null,
  },
  devices: ["iphone", "android"],
};
