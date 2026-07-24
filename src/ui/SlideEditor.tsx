import { useState } from "react";
import type { LayoutId, ToneId } from "../studio/types";
import type { BuiltinSlide } from "../studio/presets";

const LAYOUTS: { id: LayoutId; label: string }[] = [
  { id: "center", label: "Orta" },
  { id: "left", label: "Sol" },
  { id: "right", label: "Sağ" },
  { id: "card", label: "Kart" },
  { id: "finale", label: "Kapanış" },
];
const TONES: { id: ToneId; label: string }[] = [
  { id: "main", label: "Açık" },
  { id: "contrast", label: "Koyu" },
  { id: "brand", label: "Marka" },
];

export function SlideEditor({ slide, onSave, onClose }: { slide: BuiltinSlide; onSave: (s: BuiltinSlide) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<BuiltinSlide>({ ...slide });
  const set = (patch: Partial<BuiltinSlide>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="lb" onClick={onClose}>
      <div className="lb-inner" style={{ gridTemplateColumns: "1fr", maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="lb-side" style={{ borderLeft: "none" }}>
          <h4>Slaytı Düzenle</h4>

          <div className="field">
            <label>Ad</label>
            <input type="text" value={draft.name} onChange={(e) => set({ name: e.target.value })} />
          </div>

          <div className="field">
            <label>Üst etiket (kicker)</label>
            <input type="text" value={draft.kicker} onChange={(e) => set({ kicker: e.target.value })} />
          </div>

          <div className="field">
            <label>
              Başlık <span className="hint">— vurgu için *kelime*, alt satır için Enter</span>
            </label>
            <textarea rows={3} value={draft.headline} onChange={(e) => set({ headline: e.target.value })} />
          </div>

          <div className="field">
            <label>Yerleşim</label>
            <div className="seg">
              {LAYOUTS.map((l) => (
                <button key={l.id} className={draft.layout === l.id ? "on" : ""} onClick={() => set({ layout: l.id })}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Zemin tonu</label>
            <div className="seg">
              {TONES.map((t) => (
                <button key={t.id} className={draft.tone === t.id ? "on" : ""} onClick={() => set({ tone: t.id })}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={onClose}>
              Vazgeç
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                onSave(draft);
                onClose();
              }}
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
