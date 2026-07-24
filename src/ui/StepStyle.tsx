import { useState } from "react";
import type { CSSProperties } from "react";
import type { DeviceId, StyleConfig } from "../studio/types";
import type { BuiltinSlide } from "../studio/presets";
import { APP_NAME, APP_TAGLINE } from "../studio/presets";
import { SlideView, FeatureGraphicView } from "../studio/slides";
import { SlidePreview } from "./SlidePreview";
import { THEMES, FONTS, ACCENTS } from "../studio/theme";
import { DEVICES } from "../studio/devices";

const DEVICE_LIST: DeviceId[] = ["iphone", "android", "feature-graphic"];

function Toggle({ label, sub, on, onChange }: { label: string; sub?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="row">
      <div className="lbl">
        {label}
        {sub && <small>{sub}</small>}
      </div>
      <button className={`switch ${on ? "on" : ""}`} onClick={() => onChange(!on)} />
    </div>
  );
}

export function StepStyle({
  config,
  setConfig,
  slides,
  onBack,
  onGenerate,
}: {
  config: StyleConfig;
  setConfig: (c: StyleConfig) => void;
  slides: BuiltinSlide[];
  onBack: () => void;
  onGenerate: () => void;
}) {
  const set = (p: Partial<StyleConfig>) => setConfig({ ...config, ...p });
  const enabled = slides.filter((s) => s.enabled);

  const [previewIdx, setPreviewIdx] = useState(0);
  const previewSlide = enabled[Math.min(previewIdx, enabled.length - 1)] ?? enabled[0];

  const previewDevices = config.devices.length ? config.devices : (["iphone"] as DeviceId[]);
  const [previewDevice, setPreviewDevice] = useState<DeviceId>(previewDevices[0]);
  const pdev = config.devices.includes(previewDevice) ? previewDevice : previewDevices[0];
  const dev = DEVICES[pdev];

  const toggleDevice = (d: DeviceId) => {
    const has = config.devices.includes(d);
    const next = has ? config.devices.filter((x) => x !== d) : [...config.devices, d];
    set({ devices: next });
  };

  const fgShot = enabled.find((s) => s.shot)?.shot ?? "";

  return (
    <>
      <div className="page-head">
        <h1>2 · Mağaza görselini tasarla</h1>
        <p>Nasıl bir görsel istediğini burada belirle — tema, font, vurgu rengi, telefon duruşu ve yüzen öğeler. Sağdaki önizleme anında güncellenir.</p>
      </div>

      <div className="split">
        {/* Sol: kontroller */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Cihazlar</div>
            <div className="panel-sub">Hangi mağaza için üretilecek</div>
            <div className="seg" style={{ display: "flex", flexWrap: "wrap" }}>
              {DEVICE_LIST.map((d) => (
                <button key={d} className={config.devices.includes(d) ? "on" : ""} onClick={() => toggleDevice(d)}>
                  {DEVICES[d].label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">Tema & Font</div>
            <div className="field" style={{ marginTop: 12 }}>
              <label>Tema</label>
              <div className="seg">
                {THEMES.map((t) => (
                  <button key={t.id} className={config.theme === t.id ? "on" : ""} onClick={() => set({ theme: t.id })}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Başlık fontu</label>
              <select value={config.font} onChange={(e) => set({ font: e.target.value as StyleConfig["font"] })}>
                {FONTS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Vurgu rengi</label>
              <div className="swatches">
                {ACCENTS.map((c) => (
                  <div key={c} className={`swatch ${config.accent.toLowerCase() === c.toLowerCase() ? "on" : ""}`} style={{ background: c }} onClick={() => set({ accent: c })} />
                ))}
                <label className="swatch" style={{ background: config.accent, display: "grid", placeItems: "center", position: "relative" }} title="Özel renk">
                  <input type="color" value={config.accent} onChange={(e) => set({ accent: e.target.value })} style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }} />
                </label>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">Kompozisyon</div>
            <div className="field" style={{ marginTop: 12 }}>
              <label>
                Telefon eğimi · <b>{config.tilt}°</b> <span className="hint">(0 = düz)</span>
              </label>
              <input type="range" min={0} max={12} step={1} value={config.tilt} onChange={(e) => set({ tilt: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Başlık hizası</label>
              <div className="seg">
                <button className={config.align === "center" ? "on" : ""} onClick={() => set({ align: "center" })}>
                  Orta
                </button>
                <button className={config.align === "left" ? "on" : ""} onClick={() => set({ align: "left" })}>
                  Sol
                </button>
              </div>
            </div>
            <div style={{ marginTop: 6 }}>
              <Toggle label="Telefon gölgesi" on={config.shadow} onChange={(v) => set({ shadow: v })} />
              <Toggle label="Yüzen kartlar & etiketler" sub="🔔 bildirim, AI özeti, filtre çipleri" on={config.floats} onChange={(v) => set({ floats: v })} />
              <Toggle label="İnce nokta dokusu" on={config.texture} onChange={(v) => set({ texture: v })} />
            </div>
          </div>
        </div>

        {/* Sağ: canlı önizleme */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="actionbar" style={{ marginBottom: 0 }}>
            <select value={previewSlide?.id} onChange={(e) => setPreviewIdx(enabled.findIndex((s) => s.id === e.target.value))} style={{ maxWidth: 220 }}>
              {enabled.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="seg">
              {previewDevices.map((d) => (
                <button key={d} className={pdev === d ? "on" : ""} onClick={() => setPreviewDevice(d)}>
                  {DEVICES[d].label}
                </button>
              ))}
            </div>
            <div className="grow" />
            <button className="btn btn-ghost" onClick={onBack}>
              ← Geri
            </button>
            <button className="btn btn-primary btn-lg" disabled={config.devices.length === 0} onClick={onGenerate}>
              Görselleri Üret →
            </button>
          </div>

          <div className="preview-frame" style={{ "--ar": `${dev.designW} / ${dev.designH}`, maxWidth: pdev === "feature-graphic" ? "100%" : 420, margin: "0 auto" } as CSSProperties}>
            <SlidePreview designW={dev.designW} designH={dev.designH}>
              {pdev === "feature-graphic" ? (
                <FeatureGraphicView appName={APP_NAME} tagline={APP_TAGLINE} shot={fgShot} config={config} />
              ) : previewSlide ? (
                <SlideView slide={previewSlide} device={pdev} config={config} />
              ) : null}
            </SlidePreview>
          </div>
        </div>
      </div>
    </>
  );
}
