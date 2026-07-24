import { useRef, useState } from "react";
import type { StyleConfig } from "../studio/types";
import type { BuiltinSlide } from "../studio/presets";
import { BUILTIN_SLIDES } from "../studio/presets";
import { SlideView } from "../studio/slides";
import { SlidePreview } from "./SlidePreview";
import { SlideEditor } from "./SlideEditor";

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function headlinePreview(h: string) {
  return h.replace(/\*/g, "").replace(/\n/g, " · ");
}

export function StepScreens({
  slides,
  setSlides,
  config,
  onNext,
}: {
  slides: BuiltinSlide[];
  setSlides: (s: BuiltinSlide[]) => void;
  config: StyleConfig;
  onNext: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const enabledCount = slides.filter((s) => s.enabled).length;

  const patch = (id: string, p: Partial<BuiltinSlide>) => setSlides(slides.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const remove = (id: string) => setSlides(slides.filter((s) => s.id !== id));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[i], next[j]] = [next[j], next[i]];
    setSlides(next);
  };

  const onUpload = async (files: FileList | null) => {
    if (!files) return;
    const added: BuiltinSlide[] = [];
    for (const f of Array.from(files)) {
      const dataUrl = await readFile(f);
      added.push({
        id: `custom-${Math.random().toString(36).slice(2, 9)}`,
        shot: dataUrl,
        name: f.name.replace(/\.[^.]+$/, "").slice(0, 24) || "Yeni ekran",
        kicker: "",
        headline: "Başlığı buraya\nyaz.",
        layout: "center",
        tone: "main",
        enabled: true,
      });
    }
    setSlides([...slides, ...added]);
  };

  const editingSlide = slides.find((s) => s.id === editing) || null;

  return (
    <>
      <div className="page-head">
        <h1>1 · Ekran görüntülerini seç</h1>
        <p>
          Mağazada gösterilecek ekranları seç, sırala ve metinlerini düzenle. Kendi ekran görüntülerini de yükleyebilirsin. Bir sonraki adımda görsel stilini
          belirleyeceksin.
        </p>
      </div>

      <div className="actionbar">
        <span className="pill-note">{enabledCount} slayt seçili</span>
        <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>
          + Ekran görüntüsü yükle
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => setSlides(BUILTIN_SLIDES.map((s) => ({ ...s })))}>
          Hazır seti geri yükle
        </button>
        <div className="grow" />
        <button className="btn btn-primary btn-lg" disabled={enabledCount === 0} onClick={onNext}>
          Devam · Stil →
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onUpload(e.target.files)} />

      <div className="slide-grid">
        {slides.map((s, i) => (
          <div key={s.id} className={`slide-card ${s.enabled ? "" : "off"}`}>
            <div className="thumb" onClick={() => setEditing(s.id)} title="Düzenlemek için tıkla">
              <SlidePreview designW={1320} designH={2868}>
                <SlideView slide={s} device="iphone" config={config} />
              </SlidePreview>
            </div>
            <div className="meta">
              <div className="nm">{s.name}</div>
              <div className="hl">{headlinePreview(s.headline)}</div>
              <div className="card-actions">
                <button className={`switch ${s.enabled ? "on" : ""}`} title="Aç/Kapat" onClick={() => patch(s.id, { enabled: !s.enabled })} />
                <div className="grow" style={{ flex: 1 }} />
                <button className="iconbtn" title="Yukarı" onClick={() => move(i, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button className="iconbtn" title="Aşağı" onClick={() => move(i, 1)} disabled={i === slides.length - 1}>
                  ↓
                </button>
                <button className="iconbtn" title="Düzenle" onClick={() => setEditing(s.id)}>
                  ✎
                </button>
                <button className="iconbtn" title="Sil" onClick={() => remove(s.id)}>
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="upload-tile" onClick={() => fileRef.current?.click()}>
          <div style={{ fontSize: 26 }}>＋</div>
          <div>Ekran görüntüsü yükle</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-3)" }}>PNG / JPG</div>
        </div>
      </div>

      {editingSlide && <SlideEditor slide={editingSlide} onClose={() => setEditing(null)} onSave={(s) => patch(s.id, s)} />}
    </>
  );
}
