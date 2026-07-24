import { useEffect, useState } from "react";
import type { DeviceId, GenResult } from "../studio/types";
import { DEVICES } from "../studio/devices";
import { downscale, downloadDataUrl, dataUrlToBlob, writeFile } from "../studio/render";

/* ─── Lightbox: büyüt / incele / boyut boyut indir ─── */
function Lightbox({
  result,
  dirHandle,
  onClose,
  onRegenerate,
  regenerating,
}: {
  result: GenResult;
  dirHandle: FileSystemDirectoryHandle | null;
  onClose: () => void;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  const dev = DEVICES[result.device];
  const [zoom, setZoom] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dl = async (label: string, w: number, h: number) => {
    setBusy(label);
    const url = await downscale(result.dataUrl, w, h, result.width, result.height);
    downloadDataUrl(url, `${result.fileBase}-${w}x${h}.png`);
    setBusy(null);
  };

  const saveToFolder = async () => {
    if (!dirHandle) return;
    setBusy("folder");
    for (const s of dev.sizes) {
      const url = await downscale(result.dataUrl, s.w, s.h, result.width, result.height);
      await writeFile(dirHandle, result.device, `${result.fileBase}-${s.w}x${s.h}.png`, dataUrlToBlob(url));
    }
    setBusy(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="lb" onClick={onClose}>
      <div className="lb-inner" onClick={(e) => e.stopPropagation()}>
        <div className="lb-stage" onClick={() => setZoom((z) => !z)} style={{ cursor: zoom ? "zoom-out" : "zoom-in" }}>
          <img src={result.dataUrl} alt={result.label} style={{ transform: zoom ? "scale(1.6)" : "scale(1)" }} />
        </div>
        <div className="lb-side">
          <div>
            <h4>{result.label}</h4>
            <div className="dim">
              {dev.label} · {result.width}×{result.height} px
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 8, color: "var(--ink-2)" }}>İndir</div>
            <div className="dl-list">
              {dev.sizes.map((s) => (
                <button key={s.label} className="dl-row" onClick={() => dl(s.label, s.w, s.h)} disabled={busy !== null}>
                  <span className="sz">{s.label}</span>
                  <span className="px">
                    {busy === s.label ? "…" : `${s.w}×${s.h} ↓`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
            {dirHandle && (
              <button className="btn" onClick={saveToFolder} disabled={busy !== null}>
                {saved ? "✓ Klasöre kaydedildi" : busy === "folder" ? "Kaydediliyor…" : `📁 Tüm boyutları klasöre kaydet`}
              </button>
            )}
            <button className="btn" onClick={onRegenerate} disabled={regenerating}>
              {regenerating ? "Yeniden üretiliyor…" : "↻ Bu görseli yeniden üret"}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Gallery({
  results,
  regeneratingKey,
  dirHandle,
  onRegenerateOne,
  onRegenerateAll,
  onPickDir,
  onSaveAll,
  savingAll,
  onBack,
}: {
  results: GenResult[];
  regeneratingKey: string | null;
  dirHandle: FileSystemDirectoryHandle | null;
  onRegenerateOne: (key: string) => void;
  onRegenerateAll: () => void;
  onPickDir: () => void;
  onSaveAll: () => void;
  savingAll: boolean;
  onBack: () => void;
}) {
  const [lbKey, setLbKey] = useState<string | null>(null);
  const lbResult = results.find((r) => r.key === lbKey) || null;

  const devicesInOrder: DeviceId[] = ["iphone", "android", "feature-graphic"];
  const groups = devicesInOrder
    .map((d) => ({ device: d, items: results.filter((r) => r.device === d) }))
    .filter((g) => g.items.length > 0);

  const quickDownload = async (r: GenResult) => {
    const s = DEVICES[r.device].sizes[0];
    const url = await downscale(r.dataUrl, s.w, s.h, r.width, r.height);
    downloadDataUrl(url, `${r.fileBase}-${s.w}x${s.h}.png`);
  };

  return (
    <>
      <div className="page-head">
        <h1>3 · Görseller hazır</h1>
        <p>Bir görsele tıkla → büyüt, incele ve dilediğin boyutta indir. Tek tek ya da toptan yeniden üretebilir, seçtiğin klasöre topluca kaydedebilirsin.</p>
      </div>

      <div className="actionbar">
        <span className="pill-note">{results.length} görsel</span>
        <button className="btn btn-sm" onClick={onPickDir}>
          {dirHandle ? `📁 ${dirHandle.name}` : "📁 Kayıt klasörü seç"}
        </button>
        {dirHandle && (
          <button className="btn btn-sm btn-primary" onClick={onSaveAll} disabled={savingAll}>
            {savingAll ? "Kaydediliyor…" : "Tümünü klasöre kaydet"}
          </button>
        )}
        <button className="btn btn-sm" onClick={onRegenerateAll} disabled={regeneratingKey !== null}>
          ↻ Tümünü yeniden üret
        </button>
        <div className="grow" />
        <button className="btn btn-ghost" onClick={onBack}>
          ← Stili değiştir
        </button>
      </div>

      {groups.map((g) => (
        <div key={g.device} className="gallery-group">
          <h3>
            {DEVICES[g.device].label} <span style={{ color: "var(--ink-3)", fontWeight: 600, fontSize: 13 }}>· {g.items.length} görsel</span>
          </h3>
          <div className="sub">{DEVICES[g.device].sizes.map((s) => `${s.w}×${s.h}`).join(" · ")}</div>
          <div className={`gallery-grid ${g.device === "feature-graphic" ? "fg" : ""}`}>
            {g.items.map((r) => (
              <div key={r.key} className="shot">
                <div className="img" onClick={() => setLbKey(r.key)}>
                  <img src={r.dataUrl} alt={r.label} loading="lazy" />
                </div>
                <div className="bar">
                  <span className="nm">{r.label}</span>
                  <span className="acts">
                    <button className="iconbtn" title="Yeniden üret" onClick={() => onRegenerateOne(r.key)} disabled={regeneratingKey === r.key}>
                      {regeneratingKey === r.key ? "…" : "↻"}
                    </button>
                    <button className="iconbtn" title="Hızlı indir" onClick={() => quickDownload(r)}>
                      ↓
                    </button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {lbResult && (
        <Lightbox
          result={lbResult}
          dirHandle={dirHandle}
          onClose={() => setLbKey(null)}
          onRegenerate={() => onRegenerateOne(lbResult.key)}
          regenerating={regeneratingKey === lbResult.key}
        />
      )}
    </>
  );
}
