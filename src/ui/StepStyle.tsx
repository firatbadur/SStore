import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { BackgroundMode, DeviceId, LayoutId, Overlay, OverlayPatch, ShotAnchor, StyleConfig } from "../studio/types";
import type { BuiltinSlide } from "../studio/presets";
import { FeatureGraphicView, fgResolve } from "../studio/slides";
import { SlidePreview } from "./SlidePreview";
import { OverlayEditor, newCard, newImage, newPill, newText, readImageFile } from "./OverlayEditor";
import { ScreenMenu } from "./ScreenMenu";
import { EmojiPicker } from "./EmojiPicker";
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

/* ─── Açılır-kapanır bölüm (accordion) ─── */
function Section({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel section">
      <button className="section-head" onClick={() => setOpen((o) => !o)}>
        <span className="panel-title" style={{ marginBottom: 0 }}>{title}</span>
        <span className={`section-caret ${open ? "open" : ""}`}>▾</span>
      </button>
      {open && <div className="section-body">{children}</div>}
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

/* ─── Öğe yazı rengi kontrolü ─── */
function InkControl({ value, accent, onChange }: { value?: string; accent: string; onChange: (v: string | undefined) => void }) {
  return (
    <div className="field">
      <label>Yazı rengi</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <label className="swatch" style={{ width: 30, height: 30, background: value ?? "#111827", position: "relative" }} title="Yazı rengi">
          <input type="color" value={value ?? "#111827"} onChange={(e) => onChange(e.target.value)} style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }} />
        </label>
        <button className="btn btn-sm" onClick={() => onChange(accent)}>Vurgu</button>
        <button className="btn btn-sm btn-ghost" onClick={() => onChange(undefined)}>Tema</button>
      </div>
    </div>
  );
}

/* ─── Öğe arka plan rengi kontrolü ─── */
function BgControl({ value, onChange, clearLabel }: { value?: string; onChange: (v: string | undefined) => void; clearLabel: string }) {
  return (
    <div className="field">
      <label>Arka plan</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <label className="swatch" style={{ width: 30, height: 30, background: value ?? "#FFFFFF", position: "relative" }} title="Arka plan rengi">
          <input type="color" value={value ?? "#FFFFFF"} onChange={(e) => onChange(e.target.value)} style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }} />
        </label>
        <button className="btn btn-sm" onClick={() => onChange("#FFFFFF")}>Beyaz</button>
        <button className="btn btn-sm btn-ghost" onClick={() => onChange(undefined)}>{clearLabel}</button>
      </div>
    </div>
  );
}

/* ─── Seçili overlay öğesi özellikleri ─── */
function OverlayProps({
  overlay,
  accent,
  onPatch,
  onAlign,
  onDelete,
  onFront,
  onBack,
}: {
  overlay: Overlay;
  accent: string;
  onPatch: (p: OverlayPatch) => void;
  onAlign: (axis: "h" | "v", where: "start" | "center" | "end") => void;
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
            <label>Metin hizası</label>
            <div className="seg">
              {(["left", "center", "right"] as const).map((a) => (
                <button key={a} className={o.align === a ? "on" : ""} onClick={() => onPatch({ align: a })}>
                  {a === "left" ? "Sol" : a === "center" ? "Orta" : "Sağ"}
                </button>
              ))}
            </div>
          </div>
          <InkControl value={o.color} accent={accent} onChange={(v) => onPatch({ color: v })} />
          <BgControl value={o.bg} onChange={(v) => onPatch({ bg: v })} clearLabel="Yok" />
        </>
      )}

      {o.type === "pill" && (
        <>
          <div className="field">
            <label>Metin</label>
            <input type="text" value={o.text} onChange={(e) => onPatch({ text: e.target.value })} />
          </div>
          <div className="field">
            <label>İkon <span className="hint">(opsiyonel)</span></label>
            <EmojiPicker value={o.icon} onChange={(v) => onPatch({ icon: v })} />
          </div>
          <Toggle label="Dolu (kart görünümü)" on={o.solid} onChange={(v) => onPatch({ solid: v })} />
          <InkControl value={o.color} accent={accent} onChange={(v) => onPatch({ color: v })} />
          <BgControl value={o.bg} onChange={(v) => onPatch({ bg: v })} clearLabel="Varsayılan" />
        </>
      )}

      {o.type === "card" && (
        <>
          <div className="field">
            <label>Başlık</label>
            <input type="text" value={o.title} onChange={(e) => onPatch({ title: e.target.value })} />
          </div>
          <div className="field">
            <label>İkon</label>
            <EmojiPicker value={o.icon} onChange={(v) => onPatch({ icon: v })} />
          </div>
          <div className="field">
            <label>Satırlar <span className="hint">— her satır bir madde</span></label>
            <textarea rows={3} value={o.rows.join("\n")} onChange={(e) => onPatch({ rows: e.target.value.split("\n") })} />
          </div>
          <InkControl value={o.color} accent={accent} onChange={(v) => onPatch({ color: v })} />
          <BgControl value={o.bg} onChange={(v) => onPatch({ bg: v })} clearLabel="Varsayılan" />
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

      <div className="field">
        <label>Tuvalde hizala</label>
        <div className="seg" style={{ marginBottom: 6 }}>
          <button onClick={() => onAlign("h", "start")}>Sol</button>
          <button onClick={() => onAlign("h", "center")}>Ortala</button>
          <button onClick={() => onAlign("h", "end")}>Sağ</button>
        </div>
        <div className="seg">
          <button onClick={() => onAlign("v", "start")}>Üst</button>
          <button onClick={() => onAlign("v", "center")}>Orta</button>
          <button onClick={() => onAlign("v", "end")}>Alt</button>
        </div>
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
  projectName,
  config,
  setConfig,
  slides,
  setSlides,
  saveState,
  onSaveNow,
  onBack,
  onGenerate,
}: {
  projectName: string;
  config: StyleConfig;
  setConfig: (c: StyleConfig) => void;
  slides: BuiltinSlide[];
  setSlides: (s: BuiltinSlide[]) => void;
  saveState: "idle" | "saving" | "saved";
  onSaveNow: () => void;
  onBack: () => void;
  onGenerate: () => void;
}) {
  const set = (p: Partial<StyleConfig>) => setConfig({ ...config, ...p });
  const setFG = (p: Partial<StyleConfig["featureGraphic"]>) => set({ featureGraphic: { ...config.featureGraphic, ...p } });
  const enabledCount = slides.filter((s) => s.enabled).length;

  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const previewSlide = slides.find((s) => s.id === activeSlideId) ?? slides.find((s) => s.enabled) ?? slides[0] ?? null;

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
  // Öğeyi tuvalde hizala — gerçek boyutu (design px) ölçerek % konum hesapla
  const alignOverlay = (axis: "h" | "v", where: "start" | "center" | "end") => {
    if (!selId) return;
    const canvas = document.querySelector(".oe-canvas") as HTMLElement | null;
    const item = document.querySelector(`.oe-item[data-ovid="${selId}"]`) as HTMLElement | null;
    if (!canvas || !item) return;
    const m = 3; // kenar boşluğu (%)
    if (axis === "h") {
      const wPct = (item.offsetWidth / canvas.offsetWidth) * 100;
      const x = where === "start" ? m : where === "center" ? (100 - wPct) / 2 : 100 - wPct - m;
      patchOverlay({ x });
    } else {
      const hPct = (item.offsetHeight / canvas.offsetHeight) * 100;
      const y = where === "start" ? m : where === "center" ? (100 - hPct) / 2 : 100 - hPct - m;
      patchOverlay({ y });
    }
  };

  // Bu sayfanın (slaytın) kendi metni/yerleşimi
  const patchSlide = (p: Partial<BuiltinSlide>) => {
    if (!previewSlide) return;
    setSlides(slides.map((s) => (s.id === previewSlide.id ? { ...s, ...p } : s)));
  };

  // Tema & arka plan slayt bazına: FG'de genel config, slaytta o slayta özel
  const curTheme = isFG ? config.theme : previewSlide?.theme ?? config.theme;
  const bgc = isFG ? config.background : previewSlide?.background ?? config.background;
  const setTheme = (t: StyleConfig["theme"]) => (isFG ? set({ theme: t }) : patchSlide({ theme: t }));
  const setBg = (p: Partial<StyleConfig["background"]>) => {
    const next = { ...bgc, ...p };
    if (isFG) set({ background: next });
    else patchSlide({ background: next });
  };
  const applyThemeBgToAll = () => setSlides(slides.map((s) => ({ ...s, theme: curTheme, background: bgc })));

  // Ekranlar arası önceki/sonraki
  const slideIdx = slides.findIndex((s) => s.id === previewSlide?.id);
  const goSlide = (d: number) => {
    const j = slideIdx + d;
    if (j >= 0 && j < slides.length) setActiveSlideId(slides[j].id);
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

  const fg = fgResolve(slides, config, projectName);

  return (
    <>
      <div className="page-head">
        <h1>Tasarım · {projectName}</h1>
        <p>
          Ekran görüntülerini şeritten yönet, birini seçip tasarla. Tema, arka plan, font, konum ve yüzen öğeler solda; sayfa metni ve seçili öğe sağda.
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
              <label>Tema {!isFG && <span className="hint">(bu sayfaya özel)</span>}</label>
              <div className="seg">
                {THEMES.map((t) => (
                  <button key={t.id} className={curTheme === t.id ? "on" : ""} onClick={() => setTheme(t.id)}>
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
            <div className="panel-title">Arka plan {!isFG && <span className="hint">(bu sayfaya özel)</span>}</div>
            <div className="panel-sub">Temanın zemini yerine kendi rengin, gradyanın veya görselin</div>
            <div className="seg" style={{ display: "flex", flexWrap: "wrap" }}>
              {BG_MODES.map((m) => (
                <button key={m.id} className={bgc.mode === m.id ? "on" : ""} onClick={() => setBg({ mode: m.id })}>
                  {m.label}
                </button>
              ))}
            </div>

            {bgc.mode === "solid" && (
              <div className="field" style={{ marginTop: 14 }}>
                <ColorField label="Zemin rengi" value={bgc.color1} onChange={(v) => setBg({ color1: v })} />
              </div>
            )}

            {bgc.mode === "gradient" && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <ColorField label="Başlangıç" value={bgc.color1} onChange={(v) => setBg({ color1: v })} />
                <ColorField label="Bitiş" value={bgc.color2} onChange={(v) => setBg({ color2: v })} />
                <div className="field" style={{ margin: 0 }}>
                  <label>
                    Açı · <b>{bgc.angle}°</b>
                  </label>
                  <input type="range" min={0} max={360} step={1} value={bgc.angle} onChange={(e) => setBg({ angle: Number(e.target.value) })} />
                </div>
              </div>
            )}

            {bgc.mode === "image" && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="btn btn-sm" onClick={() => bgFileRef.current?.click()}>
                    {bgc.image ? "Görseli değiştir" : "Görsel yükle"}
                  </button>
                  {bgc.image && (
                    <button className="btn btn-sm btn-ghost" onClick={() => setBg({ image: undefined })}>
                      Kaldır
                    </button>
                  )}
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Oturma</label>
                  <div className="seg">
                    <button className={bgc.imageFit === "cover" ? "on" : ""} onClick={() => setBg({ imageFit: "cover" })}>
                      Doldur
                    </button>
                    <button className={bgc.imageFit === "contain" ? "on" : ""} onClick={() => setBg({ imageFit: "contain" })}>
                      Sığdır
                    </button>
                  </div>
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>
                    Karartma perdesi · <b>{Math.round(bgc.scrim * 100)}%</b> <span className="hint">(metin okunaklılığı)</span>
                  </label>
                  <input type="range" min={0} max={0.8} step={0.02} value={bgc.scrim} onChange={(e) => setBg({ scrim: Number(e.target.value) })} />
                </div>
              </div>
            )}

            {bgc.mode !== "theme" && (
              <div className="field" style={{ marginTop: 14, marginBottom: 0 }}>
                <label>Metin rengi</label>
                <div className="seg">
                  {(["auto", "dark", "light"] as const).map((k) => (
                    <button key={k} className={bgc.ink === k ? "on" : ""} onClick={() => setBg({ ink: k })}>
                      {k === "auto" ? "Otomatik" : k === "dark" ? "Koyu" : "Açık"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isFG && slides.length > 1 && (
              <button className="btn btn-sm btn-ghost" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} onClick={applyThemeBgToAll}>
                Tema & arka planı tüm ekranlara uygula
              </button>
            )}
          </div>

          <Section title="Kompozisyon" defaultOpen={false}>
            <div className="field">
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
                Telefon boyutu · <b>{Math.round(config.phoneScale * 100)}%</b>
              </label>
              <input type="range" min={0.6} max={1.4} step={0.02} value={config.phoneScale} onChange={(e) => set({ phoneScale: Number(e.target.value) })} />
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
          </Section>

        </div>

        {/* Orta: sayfa seçimi · ilerleme · tuval */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div className="actionbar" style={{ marginBottom: 0 }}>
            {!isFG && (
              <div className="seg">
                <button onClick={() => goSlide(-1)} disabled={slideIdx <= 0} title="Önceki ekran">
                  ‹
                </button>
                <button onClick={() => goSlide(1)} disabled={slideIdx < 0 || slideIdx >= slides.length - 1} title="Sonraki ekran">
                  ›
                </button>
              </div>
            )}
            {!isFG && <ScreenMenu slides={slides} setSlides={setSlides} config={config} activeId={previewSlide?.id ?? null} setActiveId={setActiveSlideId} />}
            <div className="seg">
              {previewDevices.map((d) => (
                <button key={d} className={pdev === d ? "on" : ""} onClick={() => setPreviewDevice(d)}>
                  {DEVICES[d].label}
                </button>
              ))}
            </div>
            <div className="grow" />
            <button className={`savebtn ${saveState}`} onClick={onSaveNow} title="Kaydet">
              {saveState === "saving" ? "Kaydediliyor…" : saveState === "saved" ? "✓ Kaydedildi" : "Kaydet"}
            </button>
            <button className="btn btn-ghost" onClick={onBack}>
              ← Projeler
            </button>
            <button className="btn btn-primary btn-lg" disabled={config.devices.length === 0 || enabledCount === 0} onClick={onGenerate}>
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

          {!isFG && !previewSlide ? (
            <div className="oe-empty">
              <div style={{ fontSize: 34 }}>🖼️</div>
              <div style={{ fontWeight: 700 }}>Bu projede henüz ekran görüntüsü yok</div>
              <div className="oe-hint">Yukarıdaki “＋ Ekran ekle” ile yükle.</div>
            </div>
          ) : (
            <div className="preview-frame" style={{ "--ar": `${dev.designW} / ${dev.designH}`, maxWidth: isFG ? "100%" : 420, margin: "0 auto" } as CSSProperties}>
              {isFG ? (
                <SlidePreview designW={dev.designW} designH={dev.designH}>
                  <FeatureGraphicView {...fg} config={config} />
                </SlidePreview>
              ) : previewSlide ? (
                <OverlayEditor slide={previewSlide} device={pdev} config={config} selectedId={selId} onSelect={setSelId} onChange={setOverlays} />
              ) : null}
            </div>
          )}
        </div>

        {/* Sağ: öğe seçimi & düzenleme menüsü */}
        <div className="oe-elpanel">
          {isFG ? (
            <div className="panel">
              <div className="panel-title">Feature Graphic</div>
              <div className="panel-sub">Play Store banner metni ve görseli</div>
              <div className="field">
                <label>Üst etiket</label>
                <input type="text" value={config.featureGraphic.kicker} onChange={(e) => setFG({ kicker: e.target.value })} placeholder="(opsiyonel)" />
              </div>
              <div className="field">
                <label>Başlık</label>
                <input type="text" value={config.featureGraphic.title} onChange={(e) => setFG({ title: e.target.value })} placeholder={projectName} />
              </div>
              <div className="field">
                <label>Alt metin</label>
                <textarea rows={2} value={config.featureGraphic.tagline} onChange={(e) => setFG({ tagline: e.target.value })} placeholder="(opsiyonel)" />
              </div>
              <Toggle label="Ekran görüntüsü göster" on={config.featureGraphic.showPhone} onChange={(v) => setFG({ showPhone: v })} />
              {config.featureGraphic.showPhone && (
                <div className="field" style={{ marginTop: 12, marginBottom: 0 }}>
                  <label>Görsel</label>
                  <select value={config.featureGraphic.shotSlideId ?? ""} onChange={(e) => setFG({ shotSlideId: e.target.value || null })}>
                    <option value="">İlk ekran (otomatik)</option>
                    {slides.filter((s) => s.shot).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Sayfanın kendi başlığı/etiketi — Adım 1'e dönmeden düzenlenir */}
              {previewSlide && (
                <Section title="Sayfa metni" defaultOpen={false}>
                  <div className="panel-sub" style={{ marginBottom: 12 }}>Bu sayfanın üst etiketi, başlığı ve yerleşimi</div>
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
                  <div className="field">
                    <label>
                      Başlık boyutu · <b>{Math.round((previewSlide.headingScale ?? 1) * 100)}%</b>
                    </label>
                    <input
                      type="range"
                      min={0.6}
                      max={1.6}
                      step={0.02}
                      value={previewSlide.headingScale ?? 1}
                      onChange={(e) => patchSlide({ headingScale: Number(e.target.value) })}
                    />
                  </div>
                  <div className="field" style={{ marginBottom: previewSlide.layout === "finale" ? 16 : 0 }}>
                    <label>Yerleşim</label>
                    <div className="seg">
                      {LAYOUTS.map((l) => (
                        <button key={l.id} className={previewSlide.layout === l.id ? "on" : ""} onClick={() => patchSlide({ layout: l.id })}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {previewSlide.layout === "finale" && (
                    <>
                      <Toggle label="Yıldız & puan göster" on={previewSlide.showRating ?? true} onChange={(v) => patchSlide({ showRating: v })} />
                      {(previewSlide.showRating ?? true) && (
                        <>
                          <div className="field" style={{ marginTop: 12 }}>
                            <label>Yıldız</label>
                            <div className="rating-edit">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <button
                                  key={i}
                                  className={`star ${i < (previewSlide.ratingStars ?? 5) ? "on" : ""}`}
                                  title={`${i + 1} yıldız`}
                                  onClick={() => patchSlide({ ratingStars: i + 1 })}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="field" style={{ marginBottom: 0 }}>
                            <label>Puan yazısı <span className="hint">(boş = gizli)</span></label>
                            <input type="text" value={previewSlide.ratingText ?? "Kullanıcıların ilk tercihi"} onChange={(e) => patchSlide({ ratingText: e.target.value })} />
                          </div>
                        </>
                      )}
                    </>
                  )}
                </Section>
              )}

              {selected ? (
                <OverlayProps overlay={selected} accent={config.accent} onPatch={patchOverlay} onAlign={alignOverlay} onDelete={deleteOverlay} onFront={() => moveZ(1)} onBack={() => moveZ(-1)} />
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
