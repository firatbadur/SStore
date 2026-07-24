/* ══════════════════════════════════════════════════════════════════════
   İnteraktif overlay tuvali (Adım 2 — "Görseli tasarla")
   Slaytın üzerine kullanıcının bıraktığı görsel / etiket / kart öğelerini
   sürükle-taşı ve köşeden boyutlandır. Konum/boyut % cinsinden saklanır →
   export'ta birebir aynı ölçeklenir (statik render slides.tsx'te).
   ══════════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, DragEvent as ReactDragEvent } from "react";
import type { DeviceId, Overlay, OverlayCard, OverlayImage, OverlayPatch, OverlayPill, StyleConfig } from "../studio/types";
import type { BuiltinSlide } from "../studio/presets";
import { DEVICES } from "../studio/devices";
import { SlideView, OverlayVisual, overlayStyle } from "../studio/slides";
import { surfaceOf, applyInk, resolveBackground } from "../studio/theme";

const uid = () => `ov-${Math.random().toString(36).slice(2, 9)}`;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ─── Yeni öğe fabrikaları (araç çubuğu kullanır) ─── */
export function newPill(): OverlayPill {
  return { id: uid(), type: "pill", text: "Yeni etiket", icon: "✨", x: 12, y: 42, rot: 0, scale: 1, solid: true };
}
export function newCard(): OverlayCard {
  return { id: uid(), type: "card", title: "Başlık", rows: ["Birinci satır", "İkinci satır"], icon: "📌", x: 10, y: 36, rot: 0, scale: 1 };
}
export function newImage(src: string, x = 37, y = 36): OverlayImage {
  return { id: uid(), type: "image", src, x, y, w: 26, rot: 0 };
}

export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

type DragState = { id: string; mode: "move" | "resize"; sx: number; sy: number; ox: number; oy: number; ow: number };

export function OverlayEditor({
  slide,
  device,
  config,
  selectedId,
  onSelect,
  onChange,
}: {
  slide: BuiltinSlide;
  device: DeviceId;
  config: StyleConfig;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (overlays: Overlay[]) => void;
}) {
  const dev = DEVICES[device];
  const cW = dev.designW;
  const cH = dev.designH;
  const overlays = slide.overlays ?? [];

  // Overlay görselleri için slaytla aynı yüzeyi hesapla (renk uyumu)
  const bgOverride = resolveBackground(config.background);
  let s = surfaceOf(config.theme, slide.tone, config.accent);
  if (bgOverride && config.background.ink !== "auto") s = applyInk(s, config.background.ink);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const [scale, setScale] = useState(0.14);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setScale(e.contentRect.width / cW));
    obs.observe(el);
    return () => obs.disconnect();
  }, [cW]);

  const patch = (id: string, p: OverlayPatch) => {
    onChange(overlays.map((o) => (o.id === id ? ({ ...o, ...p } as Overlay) : o)));
  };

  const rect = () => canvasRef.current?.getBoundingClientRect() ?? new DOMRect(0, 0, 1, 1);

  const startMove = (e: ReactPointerEvent, o: Overlay) => {
    e.stopPropagation();
    onSelect(o.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: o.id, mode: "move", sx: e.clientX, sy: e.clientY, ox: o.x, oy: o.y, ow: 0 };
  };
  const startResize = (e: ReactPointerEvent, o: OverlayImage) => {
    e.stopPropagation();
    onSelect(o.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: o.id, mode: "resize", sx: e.clientX, sy: e.clientY, ox: o.x, oy: o.y, ow: o.w };
  };
  const onMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const r = rect();
    const dxp = ((e.clientX - d.sx) / r.width) * 100;
    const dyp = ((e.clientY - d.sy) / r.height) * 100;
    if (d.mode === "move") patch(d.id, { x: clamp(d.ox + dxp, -30, 120), y: clamp(d.oy + dyp, -30, 120) });
    else patch(d.id, { w: clamp(d.ow + dxp, 4, 160) });
  };
  const onUp = (e: ReactPointerEvent) => {
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* yoksay */
    }
  };

  // Delete tuşu ile seçili öğeyi sil (metin alanına yazarken değil)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedId || e.key !== "Delete") return;
      const t = document.activeElement?.tagName;
      if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
      onChange(overlays.filter((o) => o.id !== selectedId));
      onSelect(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, overlays, onChange, onSelect]);

  const onDrop = async (e: ReactDragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const r = rect();
    const dx = clamp(((e.clientX - r.left) / r.width) * 100, 0, 90);
    const dy = clamp(((e.clientY - r.top) / r.height) * 100, 0, 90);
    const added: Overlay[] = [];
    for (const f of files) added.push(newImage(await readImageFile(f), dx - 13, dy - 6));
    onChange([...overlays, ...added]);
    onSelect(added[added.length - 1].id);
  };

  return (
    <div ref={rootRef} className="oe-root" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      <div
        ref={canvasRef}
        className="oe-canvas"
        style={{ width: cW, height: cH, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {/* Taban slayt (overlay'siz — çift render olmasın) */}
        <SlideView slide={{ ...slide, overlays: [] }} device={device} config={config} />

        {/* İnteraktif overlay katmanı — chrome ölçeği 1/scale ile telafi edilir */}
        <div className="oe-layer" onPointerDown={(e) => e.target === e.currentTarget && onSelect(null)}>
          {overlays.map((o) => {
            const inv = 1 / scale;
            const sel = selectedId === o.id;
            return (
              <div
                key={o.id}
                className="oe-item"
                style={{
                  ...overlayStyle(o),
                  cursor: "move",
                  outline: sel ? `${2 * inv}px solid ${config.accent}` : "none",
                  outlineOffset: `${3 * inv}px`,
                }}
                onPointerDown={(e) => startMove(e, o)}
                onPointerMove={onMove}
                onPointerUp={onUp}
              >
                <OverlayVisual o={o} cW={cW} s={s} />
                {sel && o.type === "image" && (
                  <div
                    className="oe-handle"
                    style={{
                      position: "absolute",
                      right: -10 * inv,
                      bottom: -10 * inv,
                      width: 20 * inv,
                      height: 20 * inv,
                      borderWidth: 2 * inv,
                      background: config.accent,
                      cursor: "nwse-resize",
                    }}
                    onPointerDown={(e) => startResize(e, o)}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
