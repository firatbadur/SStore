/* ══════════════════════════════════════════════════════════════════════
   Ekran şeridi (Tasarım sayfası)
   Projedeki ekran görüntülerini yönet: seç (önizle), üretime aç/kapat,
   sırala, sil, yeni yükle. Detaylı metin/stil düzenleme sağ menüde.
   ══════════════════════════════════════════════════════════════════════ */
import { useRef, useState } from "react";
import type { StyleConfig } from "../studio/types";
import type { BuiltinSlide } from "../studio/presets";
import { slideFromShot } from "../studio/projects";
import { SlideView } from "../studio/slides";
import { SlidePreview } from "./SlidePreview";
import { readImageFile } from "./OverlayEditor";

export function ScreenStrip({
  slides,
  setSlides,
  config,
  activeId,
  setActiveId,
}: {
  slides: BuiltinSlide[];
  setSlides: (s: BuiltinSlide[]) => void;
  config: StyleConfig;
  activeId: string | null;
  setActiveId: (id: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dragIdx = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const reorder = (to: number) => {
    const from = dragIdx.current;
    dragIdx.current = null;
    setOverIdx(null);
    if (from === null || from === to) return;
    const arr = [...slides];
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    setSlides(arr);
  };

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
    for (const f of Array.from(files)) added.push(slideFromShot(await readImageFile(f), f.name));
    setSlides([...slides, ...added]);
    if (added[0]) setActiveId(added[0].id);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="strip">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`strip-item ${activeId === s.id ? "active" : ""} ${s.enabled ? "" : "off"} ${overIdx === i ? "dragover" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            if (dragIdx.current !== null && overIdx !== i) setOverIdx(i);
          }}
          onDrop={(e) => {
            e.preventDefault();
            reorder(i);
          }}
          onDragEnd={() => {
            dragIdx.current = null;
            setOverIdx(null);
          }}
        >
          <div className="strip-thumb">
            <SlidePreview designW={1320} designH={2868}>
              <SlideView slide={s} device="iphone" config={config} />
            </SlidePreview>
            <span className="strip-idx">{i + 1}</span>
            <div
              className="strip-hit"
              draggable
              title="Sürükleyerek sırala · tıklayarak seç"
              onClick={() => setActiveId(s.id)}
              onDragStart={(e) => {
                dragIdx.current = i;
                e.dataTransfer.effectAllowed = "move";
              }}
            />
          </div>
          <div className="strip-bar">
            <button className={`iconbtn xs ${s.enabled ? "ok" : ""}`} title={s.enabled ? "Üretimde (kapatmak için tıkla)" : "Kapalı (açmak için tıkla)"} onClick={() => patch(s.id, { enabled: !s.enabled })}>
              {s.enabled ? "✓" : "–"}
            </button>
            <div className="grow" style={{ flex: 1 }} />
            <button className="iconbtn xs" title="Sola" onClick={() => move(i, -1)} disabled={i === 0}>
              ←
            </button>
            <button className="iconbtn xs" title="Sağa" onClick={() => move(i, 1)} disabled={i === slides.length - 1}>
              →
            </button>
            <button className="iconbtn xs" title="Sil" onClick={() => remove(s.id)}>
              ✕
            </button>
          </div>
        </div>
      ))}

      <div className="strip-add" onClick={() => fileRef.current?.click()}>
        <div style={{ fontSize: 24 }}>＋</div>
        <div>Ekran ekle</div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onUpload(e.target.files)} />
    </div>
  );
}
