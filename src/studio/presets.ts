/* ══════════════════════════════════════════════════════════════════════
   Hazır set: İhaleTakip
   Gömülü ekran görüntüleri + varsayılan metin/yerleşim/yüzen içerik.
   Kullanıcı bunları düzenleyebilir, kapatabilir, yenilerini yükleyebilir.
   ══════════════════════════════════════════════════════════════════════ */
import type { SlideSpec, StyleConfig } from "./types";
import type { FloatSpec } from "./slides";

export type BuiltinSlide = SlideSpec & { floats?: FloatSpec[] };

const P = "/screenshots/ihaletakip";

export const APP_NAME = "İhaleTakip";
export const APP_TAGLINE = "EKAP ihalelerini ara, filtrele, takip et.";

export const BUILTIN_SLIDES: BuiltinSlide[] = [
  {
    id: "home",
    shot: `${P}/home.png`,
    name: "Ana Sayfa",
    kicker: "İhale Takip",
    headline: "Tüm kamu ihaleleri,\ntek ekranda.",
    layout: "center",
    tone: "main",
    enabled: true,
    floats: [
      { kind: "pill", icon: "🔔", text: "3 yeni ihale" },
      { kind: "pill", icon: "⏱", text: "Son 24 saat" },
    ],
  },
  {
    id: "list",
    shot: `${P}/list.png`,
    name: "İhale Listesi",
    kicker: "Arama",
    headline: "Ara, bul,\n*kaçırma.*",
    layout: "left",
    tone: "main",
    enabled: true,
    floats: [
      { kind: "pill", icon: "🔎", text: "Anahtar kelime ile ara" },
      { kind: "pill", icon: "📄", text: "1.248 sonuç" },
    ],
  },
  {
    id: "filter",
    shot: `${P}/filter.png`,
    name: "Filtreler",
    kicker: "Akıllı Filtre",
    headline: "Şehir, tür, bütçe —\nanında *filtrele.*",
    layout: "right",
    tone: "main",
    enabled: true,
    floats: [
      { kind: "pill", text: "İstanbul" },
      { kind: "pill", text: "Yapım İşi" },
      { kind: "pill", text: "5M₺ +" },
    ],
  },
  {
    id: "alarm",
    shot: `${P}/detail-alarms.png`,
    name: "Hatırlatıcılar",
    kicker: "Hatırlatıcılar",
    headline: "Önemli tarihi\nasla kaçırma.",
    layout: "card",
    tone: "brand",
    enabled: true,
    floats: [{ kind: "card", icon: "🔔", title: "İhale Hatırlatıcısı", rows: ["Teklif son günü: yarın 14:00", "BAKOP 2014 · İstanbul"] }],
  },
  {
    id: "ai",
    shot: `${P}/ai-analysis.png`,
    name: "AI Analiz",
    kicker: "Yapay Zekâ",
    headline: "Şartnameyi\n*yapay zekâ* okusun.",
    layout: "left",
    tone: "main",
    enabled: true,
    floats: [{ kind: "card", icon: "🧠", title: "AI Özeti", rows: ["15 personel görevlendirilecek", "Min. 3 yıl deneyim şartı", "CAD + CBS bilgisi gerekli"] }],
  },
  {
    id: "cost",
    shot: `${P}/cost-analysis.png`,
    name: "Maliyet Analizi",
    kicker: "Maliyet Analizi",
    headline: "Rakip teklifleri gör,\ndoğru fiyatı *ver.*",
    layout: "right",
    tone: "contrast",
    enabled: true,
    floats: [
      { kind: "pill", icon: "🏷", text: "En düşük teklif ₺2,4M" },
      { kind: "pill", icon: "📊", text: "Yaklaşık maliyet ₺3,1M" },
      { kind: "pill", icon: "👥", text: "12 katılımcı" },
    ],
  },
  {
    id: "saved",
    shot: `${P}/saved-filters.png`,
    name: "Kayıtlı Filtreler",
    kicker: "Kayıtlı Filtreler",
    headline: "Bir kez kaydet,\nhep *haberdar ol.*",
    layout: "center",
    tone: "main",
    enabled: true,
    floats: [
      { kind: "pill", icon: "📌", text: "Ankara · Yapım" },
      { kind: "pill", icon: "🟢", text: "Alarm açık" },
    ],
  },
  {
    id: "documents",
    shot: `${P}/documents.png`,
    name: "Dokümanlar",
    kicker: "Dokümanlar",
    headline: "Şartname, ilan,\nsözleşme — *hepsi burada.*",
    layout: "left",
    tone: "main",
    enabled: true,
    floats: [
      { kind: "pill", text: "📄 İdari Şartname" },
      { kind: "pill", text: "📄 Teknik Şartname" },
      { kind: "pill", text: "📄 Sözleşme Tasarısı" },
    ],
  },
  {
    id: "finale",
    shot: "",
    name: "Kapanış",
    kicker: "İhale Takip",
    headline: "İhaleyi takip edenlerin\n*yeni adresi.*",
    layout: "finale",
    tone: "contrast",
    enabled: true,
    floats: [
      { kind: "pill", text: "Anlık alarmlar" },
      { kind: "pill", text: "AI şartname analizi" },
      { kind: "pill", text: "Maliyet analizi" },
      { kind: "pill", text: "Akıllı filtreleme" },
      { kind: "pill", text: "Favori & kayıtlı filtreler" },
      { kind: "pill", text: "Karanlık mod" },
    ],
  },
];

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
