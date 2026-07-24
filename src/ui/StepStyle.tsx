import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { BackgroundMode, DeviceId, LayoutId, Overlay, OverlayPatch, ShotAnchor, StyleConfig } from "../studio/types";
import type { BuiltinSlide } from "../studio/presets";
import { APP_NAME, APP_TAGLINE } from "../studio/presets";
import { FeatureGraphicView } from "../studio/slides";
import { SlidePreview } from "./SlidePreview";
import { OverlayEditor, newCard, newImage, newPill, newText, readImageFile } from "./OverlayEditor";
import { THEMES, FONTS, ACCENTS } from "../studio/theme";
import { DEVICES } from "../studio/devices";

const DEVICE_LIST: DeviceId[] = ["iphone", "android", "feature-graphic"];

const BG_MODES: { id: BackgroundMode; label: string }[] = [
  { id: "theme", label: "Tema" },
  { id: "solid", label: "Düz renk" },
  { id: "gradient", label: "Gradyan" },
  { id: "image", label: "Görsel" },
];

const LAYOUTS: { id: LayoutId; label: string }[] = [
  { id: "center", label: "Orta" },
  { id: "left", label: "Sol" },
  { id: "right", label: "Sağ" },
  { id: "card", label: "Kart" },
  { id: "finale", label: "Kapanış" },
];

const WEIGHTS: { v: number; label: string }[] = [
  { v: 400, label: "İnce" },
  { v: 600, label: "Orta" },
  { v: 700, label: "Kalın" },
  { v: 800, label: "Ekstra" },
];

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

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="colorfield">
      <label className="swatch" style={{ background: value, position: "relative" }} title={label}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }} />
      </label>
      <span>{label}</span>
      <span className="hex">{value.toUpperCase()}</span>
    </div>
  );
}

/* ─── Seçili overlay öğesi özellikleri ─── */
function OverlayProps({
  overlay,
  accent,
  onPatch,
  onDelete,
  onFront,
  onBack,
}: {
  overlay: Overlay;
  accent: string;
  onPatch: (p: OverlayPatch) => void;
  onDelete: () => void;
  onFront: () => void;
  onBack: () => void;
}) {
  const o = overlay;
  const typeLabel = o.type === "image" ? "Görsel" : o.type === "card" ? "Kart" : o.type === "text" ? "Metin" : "Etiket";
  return (
    <div className="panel">
      <div className="panel-title">Öğe · {typeLabel}</div>
      <div className="panel-sub">Tuvalde sürükleyerek taşı, seçiliyken düzenle.</div>

      {o.type === "text" && (
        <>
          <div className="field">
            <label>
              Metin <span className="hint">— vurgu için *kelime*, alt satır için Enter</span>
            </label>
            <textarea rows={2} value={o.text} onChange={(e) => onPatch({ text: e.target.value })} />
          </div>
          <div className="field">
            <label>Kalınlık</label>
            <div className="seg">
              {WEIGHTS.map((w) => (
                <button key={w.v} className={o.weight === w.v ? "on" : ""} onClick={() => onPatch({ weight: w.v })}>
                  {w.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Hiza</label>
            <div className="seg">
              {(["left", "center", "right"] as const).map((a) => (
                <button key={a} className={o.align === a ? "on" : ""} onClick={() => onPatch({ align: a })}>
                  {a === "left" ? "Sol" : a === "center" ? "Orta" : "Sağ"}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Renk</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <label className="swatch" style={{ width: 30, height: 30, background: o.color ?? "#111827", position: "relative" }} title="Özel renk">
                <input type="color" value={o.color ?? "#111827"} onChange={(e) => onPatch({ color: e.target.value })} style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }} />
              </label>
              <button className="btn btn-sm" onClick={() => onPatch({ color: accent })}>Vurgu</button>
              <button className="btn btn-sm btn-ghost" onClick={() => onPatch({ color: undefined })}>Tema rengi</button>
            </div>
          </div>
        </>
      )}

      {o.type === "pill" && (
        <>
          <div className="field">
            <label>Metin</label>
            <input type="text" value={o.text} onChange={(e) => onPatch({ text: e.target.value })} />
          </div>
          <div className="field">
            <label>İkon <span className="hint">(emoji, opsiyonel)</span></label>
            <input type="text" value={o.icon ?? ""} onChange={(e) => onPatch({ icon: e.target.value })} />
          </div>
          <Toggle label="Dolu (kart görünümü)" on={o.solid} onChange={(v) => onPatch({ solid: v })} />
        </>
      )}

      {o.type === "card" && (
        <>
          <div className="field">
            <label>Başlık</label>
            <input type="text" value={o.title} onChange={(e) => onPatch({ title: e.target.value })} />
          </div>
          <div className="field">
            <label>İkon <span className="hint">(emoji)</span></label>
            <input type="text" value={o.icon ?? ""} onChange={(e) => onPatch({ icon: e.target.value })} />
          </div>
          <div className="field">
            <label>Satırlar <span className="hint">— her satır bir madde</span></label>
            <textarea rows={3} value={o.rows.join("\n")} onChange={(e) => onPatch({ rows: e.target.value.split("\n") })} />
          </div>
        </>
      )}

      <div className="field">
        <label>
          Boyut · <b>{o.type === "image" ? `${Math.round(o.w)}%` : `${o.scale.toFixed(2)}×`}</b>
        </label>
        {o.type === "image" ? (
          <input type="range" min={5} max={120} step={1} value={o.w} onChange={(e) => onPatch({ w: Number(e.target.value) })} />
        ) : (
          <input type="range" min={0.5} max={2.5} step={0.05} value={o.scale} onChange={(e) => onPatch({ scale: Number(e.target.value) })} />
        )}
      </div>

      <div className="field">
        <label>
          Döndürme · <b>{o.rot}°</b>
        </label>
        <input type="range" min={-45} max={45} step={1} value={o.rot} onChange={(e) => onPatch({ rot: Number(e.target.value) })} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn btn-sm" onClick={onFront}>↑ Öne</button>
        <button className="btn btn-sm" onClick={onBack}>↓ Arkaya</button>
        <div className="grow" style={{ flex: 1 }} />
        <button className="btn btn-sm btn-danger" onClick={onDelete}>Sil</button>
      </div>
    </div>
  );
}

export function StepStyle({
  config,
  setConfig,
  slides,
  setSlides,
  onBack,
  onGenerate,
}: {
  config: StyleConfig;
  setConfig: (c: StyleConfig) => void;
  slides: BuiltinSlide[];
  setSlides: (s: BuiltinSlide[]) => void;
  onBack: () => void;
  onGenerate: () => void;
}) {
  const set = (p: Partial<StyleConfig>) => setConfig({ ...config, ...p });
  const setBg = (p: Partial<StyleConfig["background"]>) => set({ background: { ...config.background, ...p } });
  const enabled = slides.filter((s) => s.enabled);

  const [previewIdx, setPreviewIdx] = useState(0);
  const previewSlide = enabled[Math.min(previewIdx, enabled.length - 1)] ?? enabled[0];

  const previewDevices = config.devices.length ? config.devices : (["iphone"] as DeviceId[]);
  const [previewDevice, setPreviewDevice] = useState<DeviceId>(previewDevices[0]);
  const pdev = config.devices.includes(previewDevice) ? previewDevice : previewDevices[0];
  const dev = DEVICES[pdev];
  const isFG = pdev === "feature-graphic";

  const [selId, setSelId] = useState<string | null>(null);
  // Slayt değişince seçim sıfırlansın
  useEffect(() => setSelId(null), [previewSlide?.id]);

  const bgFileRef = useRef<HTMLInputElement>(null);
  const ovFileRef = useRef<HTMLInputElement>(null);

  const toggleDevice = (d: DeviceId) => {
    const has = config.devices.includes(d);
    const next = has ? config.devices.filter((x) => x !== d) : [...config.devices, d];
    set({ devices: next });
  };

  /* ─── Overlay yönetimi (seçili slayt üzerinde) ─── */
  const overlays = previewSlide?.overlays ?? [];
  const selected = overlays.find((o) => o.id === selId) ?? null;

  const setOverlays = (next: Overlay[]) => {
    if (!previewSlide) return;
    setSlides(slides.map((s) => (s.id === previewSlide.id ? { ...s, overlays: next } : s)));
  };
  const addOverlay = (o: Overlay) => {
    setOverlays([...overlays, o]);
    setSelId(o.id);
  };
  const patchOverlay = (p: OverlayPatch) => {
    if (!selId) return;
    setOverlays(overlays.map((o) => (o.id === selId ? ({ ...o, ...p } as Overlay) : o)));
  };
  const deleteOverlay = () => {
    if (!selId) return;
    setOverlays(overlays.filter((o) => o.id !== selId));
    setSelId(null);
  };
  const moveZ = (dir: 1 | -1) => {
    if (!selId) return;
    const i = overlays.findIndex((o) => o.id === selId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= overlays.length) return;
    const next = [...overlays];
    [next[i], next[j]] = [next[j], next[i]];
    setOverlays(next);
  };

  // Bu sayfanın (slaytın) kendi metni/yerleşimi
  const patchSlide = (p: Partial<BuiltinSlide>) => {
    if (!previewSlide) return;
    setSlides(slides.map((s) => (s.id === previewSlide.id ? { ...s, ...p } : s)));
  };

  const onBgFile = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const url = await readImageFile(files[0]);
    setBg({ image: url, mode: "image" });
    if (bgFileRef.current) bgFileRef.current.value = "";
  };
  const onOverlayFile = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) if (f.type.startsWith("image/")) addOverlay(newImage(await readImageFile(f)));
    if (ovFileRef.current) ovFileRef.current.value = "";
  };

  const fgShot = enabled.find((s) => s.shot)?.shot ?? "";

  return (
    <>
      <div className="page-head">
        <h1>2 · Mağaza görselini tasarla</h1>
        <p>
          Tema, arka plan, font, ekran görüntüsü konumu ve yüzen öğeler burada. Sağdaki tuvale görsel bırakabilir; etiket/kart ekleyip sürükleyerek yerleştirebilirsin.
        </p>
      </div>

      <div className="split3">
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

          {/* Arka plan */}
          <div className="panel">
            <div className="panel-title">Arka plan</div>
            <div className="panel-sub">Temanın zemini yerine kendi rengin, gradyanın veya görselin</div>
            <div className="seg" style={{ display: "flex", flexWrap: "wrap" }}>
              {BG_MODES.map((m) => (
                <button key={m.id} className={config.background.mode === m.id ? "on" : ""} onClick={() => setBg({ mode: m.id })}>
                  {m.label}
                </button>
              ))}
            </div>

            {config.background.mode === "solid" && (
              <div className="field" style={{ marginTop: 14 }}>
                <ColorField label="Zemin rengi" value={config.background.color1} onChange={(v) => setBg({ color1: v })} />
              </div>
            )}

            {config.background.mode === "gradient" && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <ColorField label="Başlangıç" value={config.background.color1} onChange={(v) => setBg({ color1: v })} />
                <ColorField label="Bitiş" value={config.background.color2} onChange={(v) => setBg({ color2: v })} />
                <div className="field" style={{ margin: 0 }}>
                  <label>
                    Açı · <b>{config.background.angle}°</b>
                  </label>
                  <input type="range" min={0} max={360} step={1} value={config.background.angle} onChange={(e) => setBg({ angle: Number(e.target.value) })} />
                </div>
              </div>
            )}

            {config.background.mode === "image" && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="btn btn-sm" onClick={() => bgFileRef.current?.click()}>
                    {config.background.image ? "Görseli değiştir" : "Görsel yükle"}
                  </button>
                  {config.background.image && (
                    <button className="btn btn-sm btn-ghost" onClick={() => setBg({ image: undefined })}>
                      Kaldır
                    </button>
                  )}
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Oturma</label>
                  <div className="seg">
                    <button className={config.background.imageFit === "cover" ? "on" : ""} onClick={() => setBg({ imageFit: "cover" })}>
                      Doldur
                    </button>
                    <button className={config.background.imageFit === "contain" ? "on" : ""} onClick={() => setBg({ imageFit: "contain" })}>
                      Sığdır
                    </button>
                  </div>
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>
                    Karartma perdesi · <b>{Math.round(config.background.scrim * 100)}%</b> <span className="hint">(metin okunaklılığı)</span>
                  </label>
                  <input type="range" min={0} max={0.8} step={0.02} value={config.background.scrim} onChange={(e) => setBg({ scrim: Number(e.target.value) })} />
                </div>
              </div>
            )}

            {config.background.mode !== "theme" && (
              <div className="field" style={{ marginTop: 14, marginBottom: 0 }}>
                <label>Metin rengi</label>
                <div className="seg">
                  {(["auto", "dark", "light"] as const).map((k) => (
                    <button key={k} className={config.background.ink === k ? "on" : ""} onClick={() => setBg({ ink: k })}>
                      {k === "auto" ? "Otomatik" : k === "dark" ? "Koyu" : "Açık"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-title">Kompozisyon</div>
            <div className="field" style={{ marginTop: 12 }}>
              <label>Ekran görüntüsü konumu</label>
              <div className="seg">
                {(["bottom", "top"] as ShotAnchor[]).map((a) => (
                  <button key={a} className={config.shotAnchor === a ? "on" : ""} onClick={() => set({ shotAnchor: a })}>
                    {a === "bottom" ? "Altta" : "Üstte"}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
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
              <Toggle label="Otomatik yüzen öğeler" sub="hazır set çipleri (kendi öğelerinden ayrı)" on={config.floats} onChange={(v) => set({ floats: v })} />
              <Toggle label="İnce nokta dokusu" on={config.texture} onChange={(v) => set({ texture: v })} />
            </div>
          </div>

        </div>

        {/* Orta: sayfa seçimi · ilerleme · tuval */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div className="actionbar" style={{ marginBottom: 0 }}>
            {!isFG && (
              <select value={previewSlide?.id} onChange={(e) => setPreviewIdx(enabled.findIndex((s) => s.id === e.target.value))} style={{ maxWidth: 200 }}>
                {enabled.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
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

          {/* Öğe ekleme araç çubuğu (slayt cihazları için) */}
          {!isFG && previewSlide && (
            <div className="oe-toolbar">
              <span className="oe-hint">Öğe ekle:</span>
              <button className="btn btn-sm" onClick={() => addOverlay(newText())}>＋ Metin</button>
              <button className="btn btn-sm" onClick={() => addOverlay(newPill())}>＋ Etiket</button>
              <button className="btn btn-sm" onClick={() => addOverlay(newCard())}>＋ Kart</button>
              <button className="btn btn-sm" onClick={() => ovFileRef.current?.click()}>＋ Görsel</button>
              <div className="grow" style={{ flex: 1 }} />
              <span className="oe-hint">{overlays.length} öğe · tuvale sürükle-bırak</span>
            </div>
          )}

          <div className="preview-frame" style={{ "--ar": `${dev.designW} / ${dev.designH}`, maxWidth: isFG ? "100%" : 420, margin: "0 auto" } as CSSProperties}>
            {isFG ? (
              <SlidePreview designW={dev.designW} designH={dev.designH}>
                <FeatureGraphicView appName={APP_NAME} tagline={APP_TAGLINE} shot={fgShot} config={config} />
              </SlidePreview>
            ) : previewSlide ? (
              <OverlayEditor slide={previewSlide} device={pdev} config={config} selectedId={selId} onSelect={setSelId} onChange={setOverlays} />
            ) : null}
          </div>
        </div>

        {/* Sağ: öğe seçimi & düzenleme menüsü */}
        <div className="oe-elpanel">
          {isFG ? (
            <div className="panel oe-side-empty">
              <div className="panel-title">Öğe düzenleme</div>
              <div className="panel-sub" style={{ marginBottom: 0 }}>
                Feature Graphic için serbest öğe yok. iPhone ya da Android seçince metin, etiket, kart ve görsel ekleyebilirsin.
              </div>
            </div>
          ) : (
            <>
              {/* Sayfanın kendi başlığı/etiketi — Adım 1'e dönmeden düzenlenir */}
              {previewSlide && (
                <div className="panel">
                  <div className="panel-title">Sayfa metni</div>
                  <div className="panel-sub">Bu sayfanın üst etiketi, başlığı ve yerleşimi</div>
                  <div className="field">
                    <label>Üst etiket</label>
                    <input type="text" value={previewSlide.kicker} onChange={(e) => patchSlide({ kicker: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>
                      Başlık <span className="hint">— *vurgu* + Enter</span>
                    </label>
                    <textarea rows={3} value={previewSlide.headline} onChange={(e) => patchSlide({ headline: e.target.value })} />
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Yerleşim</label>
                    <div className="seg">
                      {LAYOUTS.map((l) => (
                        <button key={l.id} className={previewSlide.layout === l.id ? "on" : ""} onClick={() => patchSlide({ layout: l.id })}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selected ? (
                <OverlayProps overlay={selected} accent={config.accent} onPatch={patchOverlay} onDelete={deleteOverlay} onFront={() => moveZ(1)} onBack={() => moveZ(-1)} />
              ) : (
                <div className="panel oe-side-empty">
                  <div className="panel-title">Öğe eklemek için</div>
                  <div className="panel-sub" style={{ marginBottom: 0 }}>
                    Ortadaki “＋ Metin / Etiket / Kart / Görsel” ile ekle, ya da tuvaldeki bir öğeye tıklayıp buradan düzenle.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <input ref={bgFileRef} type="file" accept="image/*" hidden onChange={(e) => onBgFile(e.target.files)} />
      <input ref={ovFileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onOverlayFile(e.target.files)} />
    </>
  );
}
