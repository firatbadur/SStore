/* ══════════════════════════════════════════════════════════════════════
   Cihaz profilleri + çerçeveler
   ══════════════════════════════════════════════════════════════════════ */
import type { CSSProperties, ReactElement } from "react";
import type { DeviceId, ExportSize } from "./types";
import { resolveImg } from "./assets";

/* iPhone mockup (public/mockup.png — ön ölçülü) */
const MK_W = 1022;
const MK_H = 2082;
const SC_L = (52 / MK_W) * 100;
const SC_T = (46 / MK_H) * 100;
const SC_W = (918 / MK_W) * 100;
const SC_H = (1990 / MK_H) * 100;
const SC_RX = (126 / 918) * 100;
const SC_RY = (126 / 1990) * 100;

export const MK_RATIO = MK_W / MK_H;
export const ANDROID_RATIO = 9 / 19.5;

export type FrameProps = { src: string; alt: string; style?: CSSProperties };
export type Frame = (p: FrameProps) => ReactElement;

export function IPhoneFrame({ src, alt, style }: FrameProps) {
  return (
    <div style={{ position: "relative", aspectRatio: `${MK_W}/${MK_H}`, ...style }}>
      <img src={resolveImg("/mockup.png")} alt="" style={{ display: "block", width: "100%", height: "100%" }} draggable={false} />
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          overflow: "hidden",
          left: `${SC_L}%`,
          top: `${SC_T}%`,
          width: `${SC_W}%`,
          height: `${SC_H}%`,
          borderRadius: `${SC_RX}% / ${SC_RY}%`,
        }}
      >
        <img src={resolveImg(src)} alt={alt} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} draggable={false} />
      </div>
    </div>
  );
}

export function AndroidFrame({ src, alt, style }: FrameProps) {
  return (
    <div style={{ position: "relative", aspectRatio: "9/19.5", ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8.5% / 4%",
          background: "linear-gradient(158deg, #23242A 0%, #131317 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 6px rgba(0,0,0,0.35)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "1.5%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "2.6%",
            height: "1.25%",
            borderRadius: "50%",
            background: "#050506",
            boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.06)",
            zIndex: 20,
          }}
        />
        <div style={{ position: "absolute", left: "3.2%", top: "1.8%", width: "93.6%", height: "96.4%", borderRadius: "6% / 2.8%", overflow: "hidden", background: "#000" }}>
          <img src={resolveImg(src)} alt={alt} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} draggable={false} />
        </div>
      </div>
    </div>
  );
}

export interface DeviceProfile {
  id: DeviceId;
  label: string;
  designW: number;
  designH: number;
  ratio: number;
  Frame: Frame;
  sizes: ExportSize[];
  /** feature-graphic gibi tekil (slayt başına değil) ürünler için */
  singular: boolean;
}

export const DEVICES: Record<DeviceId, DeviceProfile> = {
  iphone: {
    id: "iphone",
    label: "iPhone",
    designW: 1320,
    designH: 2868,
    ratio: MK_RATIO,
    Frame: IPhoneFrame,
    singular: false,
    sizes: [
      { label: '6.9"', w: 1320, h: 2868 },
      { label: '6.5"', w: 1284, h: 2778 },
      { label: '6.3"', w: 1206, h: 2622 },
      { label: '6.1"', w: 1125, h: 2436 },
    ],
  },
  android: {
    id: "android",
    label: "Android",
    designW: 1440,
    designH: 2560,
    ratio: ANDROID_RATIO,
    Frame: AndroidFrame,
    singular: false,
    sizes: [
      { label: "Play FHD", w: 1080, h: 1920 },
      { label: "Play QHD", w: 1440, h: 2560 },
    ],
  },
  "feature-graphic": {
    id: "feature-graphic",
    label: "Feature Graphic",
    designW: 1024,
    designH: 500,
    ratio: MK_RATIO,
    Frame: IPhoneFrame,
    singular: true,
    sizes: [{ label: "Banner", w: 1024, h: 500 }],
  },
};

/** Telefon genişliği: canvas'a göre en-boy oranı ve hedef yüksekliğe göre ölçekle */
export function fitWidth(cW: number, cH: number, ratio: number, heightFrac: number, clamp: number) {
  const w = (heightFrac * cH * ratio) / cW;
  return Math.min(clamp, w);
}
