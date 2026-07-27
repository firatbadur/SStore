/* ══════════════════════════════════════════════════════════════════════
   Ekran açılır menüsü (Tasarım sayfası araç çubuğu)
   Yatay şerit yerine: küçük önizlemeli bir açılır menü. Ekran seç, üretime
   aç/kapat, sürükleyerek sırala, sil, yeni yükle — hepsi tek popover'da,
   dikey yer kaplamadan.
   ══════════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from "react";
import type { StyleConfig } from "../studio/types";
import type { BuiltinSlide } from "../studio/presets";
import { slideFromShot } from "../studio/projects";
import { SlideView } from "../studio/slides";
import { SlidePreview } from "./SlidePreview";
import { readImageFile } from "./OverlayEditor";

function Thumb({ slide, config }: { slide: BuiltinSlide; config: StyleConfig }) {
  return (
    <SlidePreview designW={1320} designH={2868}>
      <SlideView slide={slide} device="iphone" config={config} />
    </SlidePreview>
  );
}

export function ScreenMenu({
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
  const [open, setOpen] = useState(false);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragIdx = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const active = slides.find((s) => s.id === activeId) ?? null;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const patch = (id: string, p: Partial<BuiltinSlide>) => setSlides(slides.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const remove = (id: string) => setSlides(slides.filter((s) => s.id !== id));
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
  const onUpload = async (files: FileList | null) => {
    if (!files) return;
    const added: BuiltinSlide[] = [];
    for (const f of Array.from(files)) added.push(slideFromShot(await readImageFile(f), f.name));
    setSlides([...slides, ...added]);
    if (added[0]) setActiveId(added[0].id);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="screenmenu" ref={rootRef}>
      <button className="sm-trigger" onClick={() => setOpen((o) => !o)} title="Ekran seç / yönet">
        <span className="sm-trigger-thumb">{active ? <Thumb slide={active} config={config} /> : "🖼️"}</span>
        <span className="sm-trigger-name">{active?.name ?? "Ekran seç"}</span>
        <span className="sm-caret">▾</span>
      </button>

      {open && (
        <div className="sm-pop">
          <div className="sm-pop-head">Ekranlar · {slides.length}</div>
          <div className="sm-list">
            {slides.map((s, i) => (
              <div
                key={s.id}
                className={`sm-row ${activeId === s.id ? "active" : ""} ${s.enabled ? "" : "off"} ${overIdx === i ? "dragover" : ""}`}
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
                <span
                  className="sm-handle"
                  draggable
                  title="Sürükleyerek sırala"
                  onDragStart={(e) => {
                    dragIdx.current = i;
                    e.dataTransfer.effectAllowed = "move";
                  }}
                >
                  ⠿
                </span>
                <div className="sm-thumb" onClick={() => { setActiveId(s.id); setOpen(false); }}>
                  <Thumb slide={s} config={config} />
                </div>
                <button className="sm-name" onClick={() => { setActiveId(s.id); setOpen(false); }}>
                  {s.name}
                </button>
                <button className={`iconbtn xs ${s.enabled ? "ok" : ""}`} title={s.enabled ? "Üretimde" : "Kapalı"} onClick={() => patch(s.id, { enabled: !s.enabled })}>
                  {s.enabled ? "✓" : "–"}
                </button>
                <button className="iconbtn xs" title="Sil" onClick={() => remove(s.id)}>
                  ✕
                </button>
              </div>
            ))}
            {slides.length === 0 && <div className="sm-empty">Henüz ekran yok</div>}
          </div>
          <button className="btn btn-sm sm-add" onClick={() => fileRef.current?.click()}>
            ＋ Ekran ekle
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onUpload(e.target.files)} />
        </div>
      )}
    </div>
  );
}
