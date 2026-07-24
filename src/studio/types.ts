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

export type ThemeId = "editorial" | "midnight" | "brand";
export type FontId =
  | "jakarta"
  | "grotesk"
  | "sora"
  | "manrope"
  | "bricolage"
  | "archivo"
  | "inter";

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
}

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
