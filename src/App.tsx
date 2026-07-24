import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { DeviceId, GenResult, StyleConfig } from "./studio/types";
import { BUILTIN_SLIDES, DEFAULT_CONFIG, APP_NAME, APP_TAGLINE, type BuiltinSlide } from "./studio/presets";
import { DEVICES } from "./studio/devices";
import { SlideView, FeatureGraphicView } from "./studio/slides";
import { preloadAll } from "./studio/assets";
import { captureNode, downscale, dataUrlToBlob, writeFile, pickDirectory, fsSupported } from "./studio/render";
import { StepScreens } from "./ui/StepScreens";
import { StepStyle } from "./ui/StepStyle";
import { Gallery } from "./ui/Gallery";

type Phase = "screens" | "style" | "generating" | "result";

interface StageItem {
  key: string;
  device: DeviceId;
  label: string;
  fileBase: string;
  w: number;
  h: number;
  node: ReactNode;
}

const nextPaint = () => new Promise<void>((res) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(res, 60))));

function buildItems(slides: BuiltinSlide[], config: StyleConfig): StageItem[] {
  const enabled = slides.filter((s) => s.enabled);
  const out: StageItem[] = [];
  for (const device of config.devices) {
    if (device === "feature-graphic") {
      const shot = enabled.find((s) => s.shot)?.shot ?? "";
      out.push({
        key: "feature-graphic",
        device,
        label: "Feature Graphic",
        fileBase: "feature-graphic",
        w: DEVICES[device].designW,
        h: DEVICES[device].designH,
        node: <FeatureGraphicView appName={APP_NAME} tagline={APP_TAGLINE} shot={shot} config={config} />,
      });
    } else {
      const d = DEVICES[device];
      enabled.forEach((s, i) => {
        out.push({
          key: `${device}-${s.id}`,
          device,
          label: s.name,
          fileBase: `${device}-${String(i + 1).padStart(2, "0")}-${s.id}`,
          w: d.designW,
          h: d.designH,
          node: <SlideView slide={s} device={device} config={config} />,
        });
      });
    }
  }
  return out;
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("screens");
  const [slides, setSlides] = useState<BuiltinSlide[]>(() => BUILTIN_SLIDES.map((s) => ({ ...s })));
  const [config, setConfig] = useState<StyleConfig>(DEFAULT_CONFIG);
  const [results, setResults] = useState<GenResult[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [pending, setPending] = useState<"all" | string[] | null>(null);

  const stageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const items = useMemo(() => buildItems(slides, config), [slides, config]);
  const stageMounted = phase === "generating" || phase === "result";

  // Gömülü görselleri baştan data-URI'ye çevir (export güvenilirliği)
  useEffect(() => {
    preloadAll(["/mockup.png", ...BUILTIN_SLIDES.map((s) => s.shot).filter(Boolean)]).catch(() => {});
  }, []);

  const captureItems = useCallback(async (targets: StageItem[]): Promise<GenResult[]> => {
    const done: GenResult[] = [];
    for (let i = 0; i < targets.length; i++) {
      const it = targets[i];
      const el = stageRefs.current[it.key];
      if (!el) continue;
      const dataUrl = await captureNode(el, it.w, it.h);
      done.push({ key: it.key, device: it.device, label: it.label, fileBase: it.fileBase, dataUrl, width: it.w, height: it.h });
      setProgress({ done: i + 1, total: targets.length });
    }
    return done;
  }, []);

  // Üretim akışı — stage mount olup boyandıktan sonra çalışır
  useEffect(() => {
    if (!pending) return;
    let cancelled = false;
    (async () => {
      await preloadAll(["/mockup.png", ...slides.filter((s) => s.enabled).map((s) => s.shot).filter(Boolean)]);
      await nextPaint();
      if (cancelled) return;

      if (pending === "all") {
        setProgress({ done: 0, total: items.length });
        const res = await captureItems(items);
        if (cancelled) return;
        setResults(res);
        setPhase("result");
      } else {
        const keys = pending;
        const targets = items.filter((it) => keys.includes(it.key));
        const res = await captureItems(targets);
        if (cancelled) return;
        setResults((prev) => {
          const map = new Map(prev.map((r) => [r.key, r]));
          for (const r of res) map.set(r.key, r);
          return items.map((it) => map.get(it.key)).filter(Boolean) as GenResult[];
        });
      }
      setRegeneratingKey(null);
      setPending(null);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  const startGenerateAll = () => {
    setResults([]);
    setPhase("generating");
    setProgress({ done: 0, total: items.length });
    setPending("all");
  };

  const regenerateOne = (key: string) => {
    setRegeneratingKey(key);
    setPending([key]);
  };

  const regenerateAll = () => {
    setRegeneratingKey("__all__");
    setPending(items.map((it) => it.key));
  };

  const pickDir = async () => {
    if (!fsSupported()) {
      alert("Tarayıcınız klasör seçimini desteklemiyor. Chrome veya Edge kullanın ya da görselleri tek tek indirin.");
      return;
    }
    const h = await pickDirectory();
    if (h) setDirHandle(h);
  };

  const saveAll = async () => {
    if (!dirHandle) return;
    setSavingAll(true);
    try {
      for (const r of results) {
        for (const s of DEVICES[r.device].sizes) {
          const url = await downscale(r.dataUrl, s.w, s.h, r.width, r.height);
          await writeFile(dirHandle, r.device, `${r.fileBase}-${s.w}x${s.h}.png`, dataUrlToBlob(url));
        }
      }
    } finally {
      setSavingAll(false);
    }
  };

  const goStep = (p: Phase) => setPhase(p);
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  const stepState = (target: Phase): string => {
    const order: Phase[] = ["screens", "style", "result"];
    const cur = phase === "generating" ? "result" : phase;
    const ci = order.indexOf(cur);
    const ti = order.indexOf(target);
    if (cur === target) return "active";
    if (ti < ci) return "done";
    return "";
  };

  const hasEnabled = slides.some((s) => s.enabled);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">S</span>
          SStore
          <small>Ekran Görüntüsü Stüdyosu</small>
        </div>
        <div className="topbar-spacer" />
        <nav className="steps">
          <button className={`step ${stepState("screens")} clickable`} onClick={() => goStep("screens")}>
            <span className="n">1</span> Ekranlar
          </button>
          <span className="step-sep" />
          <button className={`step ${stepState("style")} ${hasEnabled ? "clickable" : ""}`} onClick={() => hasEnabled && goStep("style")}>
            <span className="n">2</span> Stil
          </button>
          <span className="step-sep" />
          <button className={`step ${stepState("result")} ${results.length ? "clickable" : ""}`} onClick={() => results.length && goStep("result")}>
            <span className="n">3</span> Görseller
          </button>
        </nav>
      </header>

      <main className="main">
        {phase === "screens" && <StepScreens slides={slides} setSlides={setSlides} config={config} onNext={() => setPhase("style")} />}

        {phase === "style" && <StepStyle config={config} setConfig={setConfig} slides={slides} setSlides={setSlides} onBack={() => setPhase("screens")} onGenerate={startGenerateAll} />}

        {phase === "generating" && (
          <div className="progress-wrap">
            <div className="spinner" />
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>Görseller üretiliyor…</div>
              <div style={{ color: "var(--ink-3)", marginTop: 6 }}>
                {progress.done} / {progress.total}
              </div>
            </div>
            <div className="progress-bar">
              <div style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {phase === "result" && (
          <Gallery
            results={results}
            regeneratingKey={regeneratingKey}
            dirHandle={dirHandle}
            onRegenerateOne={regenerateOne}
            onRegenerateAll={regenerateAll}
            onPickDir={pickDir}
            onSaveAll={saveAll}
            savingAll={savingAll}
            onBack={() => setPhase("style")}
          />
        )}
      </main>

      {/* Gizli yakalama sahnesi — tam çözünürlükte render, capture buradan */}
      {stageMounted && (
        <div className="stage-hidden" aria-hidden>
          {items.map((it) => (
            <div
              key={it.key}
              ref={(el) => {
                stageRefs.current[it.key] = el;
              }}
              style={{ width: it.w, height: it.h }}
            >
              {it.node}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
