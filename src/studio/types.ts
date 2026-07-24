/* ══════════════════════════════════════════════════════════════════════
   SStore — Tip modeli
   Ekran görüntüsü stüdyosunun tüm veri sözleşmeleri burada.
   ══════════════════════════════════════════════════════════════════════ */

/** Hedef mağaza cihazı */
export type DeviceId = "iphone" | "android" | "feature-graphic";

/** Slayt yerleşim şablonu (aynı motor, farklı kompozisyon) */
export type LayoutId = "center" | "left" | "right" | "card" | "finale";

/** Yüzey tonu — tema bunları somut renklere çevirir (ritim için) */
export type ToneId = "main" | "contrast" | "brand";

export type ThemeId =
  | "editorial"
  | "midnight"
  | "brand"
  | "sunset"
  | "emerald"
  | "graphite"
  | "pearl"
  | "violet"
  | "ocean"
  | "rose";
export type FontId =
  | "jakarta"
  | "grotesk"
  | "sora"
  | "manrope"
  | "bricolage"
  | "archivo"
  | "inter";

/* ─── Serbest konumlu overlay öğeleri (kullanıcı ekler, taşır, boyutlandırır) ─── */

/** Tüm overlay'lerde ortak: konum (% cinsinden, sol-üst köşe) + döndürme */
interface OverlayBase {
  id: string;
  /** Sol köşe — tuval genişliğinin yüzdesi (0–100) */
  x: number;
  /** Üst köşe — tuval yüksekliğinin yüzdesi (0–100) */
  y: number;
  /** Döndürme (derece) */
  rot: number;
}

/** Kullanıcının bıraktığı PNG/SVG görsel */
export interface OverlayImage extends OverlayBase {
  type: "image";
  /** data URL */
  src: string;
  /** Genişlik — tuval genişliğinin yüzdesi */
  w: number;
}

/** Kullanıcının eklediği yüzen etiket (pill) */
export interface OverlayPill extends OverlayBase {
  type: "pill";
  text: string;
  icon?: string;
  /** Boyut çarpanı (1 = varsayılan) */
  scale: number;
  /** Dolu (kart benzeri) mı, yarı saydam mı */
  solid: boolean;
}

/** Kullanıcının eklediği yüzen kart */
export interface OverlayCard extends OverlayBase {
  type: "card";
  title: string;
  rows: string[];
  icon?: string;
  scale: number;
}

export type Overlay = OverlayImage | OverlayPill | OverlayCard;

/** Kısmi güncelleme — tüm overlay alanları opsiyonel (tipe özel dahil) */
export interface OverlayPatch {
  x?: number;
  y?: number;
  rot?: number;
  w?: number;
  src?: string;
  text?: string;
  icon?: string;
  scale?: number;
  solid?: boolean;
  title?: string;
  rows?: string[];
}

/** Kullanıcının seçtiği tek bir ekran görüntüsü → bir slayt */
export interface SlideSpec {
  id: string;
  /** Görsel kaynağı: /screenshots/... yolu veya yüklenen data URL */
  shot: string;
  /** Kaynak adı (galeride/dosya adında kullanılır) */
  name: string;
  kicker: string;
  /** Başlık — vurgu için *kelime*, satır için \n */
  headline: string;
  layout: LayoutId;
  tone: ToneId;
  /** Bu slayt üretime dahil mi */
  enabled: boolean;
  /** Kullanıcının serbest yerleştirdiği görsel/etiket/kart öğeleri */
  overlays?: Overlay[];
}

/** Arka plan modu — tema yüzeyini geçersiz kılabilir */
export type BackgroundMode = "theme" | "solid" | "gradient" | "image";

/** Özel arka plan ayarı ("theme" = temanın kendi zemini) */
export interface BackgroundConfig {
  mode: BackgroundMode;
  /** solid / gradyan başlangıç rengi */
  color1: string;
  /** gradyan bitiş rengi */
  color2: string;
  /** gradyan açısı (derece) */
  angle: number;
  /** yüklenen arka plan görseli (data URL) */
  image?: string;
  /** görsel oturması */
  imageFit: "cover" | "contain";
  /** görselin üzerine karartma perdesi (0–1) — metin okunaklılığı için */
  scrim: number;
  /** metin rengi: auto = temaya bırak, light/dark = zorla */
  ink: "auto" | "light" | "dark";
}

/** Ekran görüntüsünün dikey yerleşimi */
export type ShotAnchor = "bottom" | "top";

/** Üretim stili — "nasıl bir mağaza görseli" sorusunun cevabı */
export interface StyleConfig {
  theme: ThemeId;
  font: FontId;
  /** Vurgu rengi (hex) — kicker + vurgulu kelimeler */
  accent: string;
  /** Telefon eğim açısı (derece). 0 = düz */
  tilt: number;
  /** Telefon gölgesi */
  shadow: boolean;
  /** Yüzen kart / pill'ler görünsün mü */
  floats: boolean;
  /** İnce nokta dokusu */
  texture: boolean;
  /** Başlık hizası */
  align: "center" | "left";
  /** Ekran görüntüsü üstte mi altta mı; üst etiket karşı tarafa geçer */
  shotAnchor: ShotAnchor;
  /** Özel arka plan */
  background: BackgroundConfig;
  /** Üretilecek cihazlar */
  devices: DeviceId[];
}

/** Üretilecek tek bir görsel işi */
export interface GenItem {
  key: string;
  device: DeviceId;
  slideId: string | null; // feature-graphic için null
  label: string;
  fileBase: string;
}

/** Üretilmiş görsel sonucu */
export interface GenResult {
  key: string;
  device: DeviceId;
  label: string;
  fileBase: string;
  /** Tam çözünürlük PNG (data URL) */
  dataUrl: string;
  width: number;
  height: number;
}

/** Export boyutu */
export interface ExportSize {
  label: string;
  w: number;
  h: number;
}
