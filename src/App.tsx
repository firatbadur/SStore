import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { DeviceId, GenResult, StyleConfig } from "./studio/types";
import { DEFAULT_CONFIG, type BuiltinSlide } from "./studio/presets";
import type { Project } from "./studio/projects";
import { loadProjects, saveProjects, newProject, duplicateProject, slideFromShot } from "./studio/projects";
import { DEVICES } from "./studio/devices";
import { SlideView, FeatureGraphicView, fgResolve } from "./studio/slides";
import { preloadAll } from "./studio/assets";
import { captureNode, downscale, dataUrlToBlob, dataUrlToBytes, makeZip, writeFile, pickDirectory, fsSupported } from "./studio/render";
import { readImageFile } from "./ui/OverlayEditor";
import { ProjectsHome } from "./ui/ProjectsHome";
import { StepStyle } from "./ui/StepStyle";
import { Gallery } from "./ui/Gallery";

type Phase = "projects" | "design" | "generating" | "result";

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

function buildItems(slides: BuiltinSlide[], config: StyleConfig, projectName: string): StageItem[] {
  const enabled = slides.filter((s) => s.enabled);
  const out: StageItem[] = [];
  for (const device of config.devices) {
    if (device === "feature-graphic") {
      const fg = fgResolve(slides, config, projectName);
      out.push({
        key: "feature-graphic",
        device,
        label: "Feature Graphic",
        fileBase: "feature-graphic",
        w: DEVICES[device].designW,
        h: DEVICES[device].designH,
        node: <FeatureGraphicView {...fg} config={config} />,
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
  const [phase, setPhase] = useState<Phase>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("saved");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [results, setResults] = useState<GenResult[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [pending, setPending] = useState<"all" | string[] | null>(null);

  const stageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const newFileRef = useRef<HTMLInputElement>(null);
  const pendingName = useRef<string>("Yeni proje");

  const active = projects.find((p) => p.id === activeId) ?? null;
  const slides = active?.slides ?? [];
  const config = active?.config ?? DEFAULT_CONFIG;

  const items = useMemo(() => buildItems(slides, config, active?.name ?? ""), [slides, config, active?.name]);
  const stageMounted = phase === "generating" || phase === "result";

  // Projeleri IndexedDB'den yükle (async)
  useEffect(() => {
    loadProjects().then((p) => {
      setProjects(p);
      setLoaded(true);
    });
  }, []);

  // Değişiklikleri otomatik kaydet (debounce) + durum göster
  useEffect(() => {
    if (!loaded) return;
    setSaveState("saving");
    const t = setTimeout(() => {
      saveProjects(projects)
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("idle"));
    }, 600);
    return () => clearTimeout(t);
  }, [projects, loaded]);

  const saveNow = useCallback(() => {
    setSaveState("saving");
    saveProjects(projects)
      .then(() => setSaveState("saved"))
      .catch(() => setSaveState("idle"));
  }, [projects]);

  // Telefon çerçevesini baştan data-URI'ye çevir (export güvenilirliği)
  useEffect(() => {
    preloadAll(["/mockup.png"]).catch(() => {});
  }, []);

  /* ─── Proje güncelleme (aktif projenin slides/config'i) ─── */
  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)));
  }, []);
  const setSlides = useCallback((next: BuiltinSlide[]) => { if (activeId) updateProject(activeId, { slides: next }); }, [activeId, updateProject]);
  const setConfig = useCallback((next: StyleConfig) => { if (activeId) updateProject(activeId, { config: next }); }, [activeId, updateProject]);

  /* ─── Proje yaşam döngüsü ─── */
  const openProject = (id: string) => {
    setActiveId(id);
    setResults([]);
    setPhase("design");
  };
  const startNewProject = () => {
    const name = prompt("Proje adı", "Yeni proje");
    if (name === null) return; // vazgeçti
    pendingName.current = name.trim() || "Yeni proje";
    newFileRef.current?.click();
  };
  const onNewFiles = async (files: FileList | null) => {
    const slidesNew: BuiltinSlide[] = [];
    if (files) for (const f of Array.from(files)) slidesNew.push(slideFromShot(await readImageFile(f), f.name));
    const proj = newProject(pendingName.current, slidesNew);
    setProjects((prev) => [proj, ...prev]);
    setActiveId(proj.id);
    setResults([]);
    setPhase("design");
    if (newFileRef.current) newFileRef.current.value = "";
  };
  const renameProject = (id: string) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    const name = prompt("Yeni ad", p.name);
    if (name !== null && name.trim()) updateProject(id, { name: name.trim() });
  };
  const duplicate = (id: string) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    setProjects((prev) => [duplicateProject(p), ...prev]);
  };
  const removeProject = (id: string) => {
    const p = projects.find((x) => x.id === id);
    if (!p || !confirm(`"${p.name}" silinsin mi? Bu geri alınamaz.`)) return;
    setProjects((prev) => prev.filter((x) => x.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setPhase("projects");
    }
  };

  /* ─── Üretim ─── */
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

  // Cihaz → ZIP klasör adı
  const deviceFolder = (d: DeviceId) => (d === "iphone" ? "ios" : d === "android" ? "android" : "feature-graphic");

  // Tüm görselleri (her boyutta) klasörlere ayrılmış tek bir ZIP olarak indir
  const downloadZip = useCallback(
    async (res: GenResult[]) => {
      if (!res.length) return;
      setZipping(true);
      try {
        const files: { name: string; data: Uint8Array }[] = [];
        for (const r of res) {
          for (const s of DEVICES[r.device].sizes) {
            const url = await downscale(r.dataUrl, s.w, s.h, r.width, r.height);
            files.push({ name: `${deviceFolder(r.device)}/${r.fileBase}-${s.w}x${s.h}.png`, data: dataUrlToBytes(url) });
          }
        }
        const zip = makeZip(files);
        const href = URL.createObjectURL(zip);
        const a = document.createElement("a");
        a.href = href;
        a.download = `${(active?.name || "sstore").replace(/[^\w.-]+/g, "_") || "sstore"}.zip`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(href), 5000);
      } finally {
        setZipping(false);
      }
    },
    [active?.name],
  );

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
        downloadZip(res); // üretim biter bitmez projeyi ZIP olarak indir
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

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  const stepState = (target: Phase): string => {
    const order: Phase[] = ["projects", "design", "result"];
    const cur = phase === "generating" ? "design" : phase;
    const ci = order.indexOf(cur);
    const ti = order.indexOf(target);
    if (cur === target) return "active";
    if (ti < ci) return "done";
    return "";
  };

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
          <button className={`step ${stepState("projects")} clickable`} onClick={() => setPhase("projects")}>
            <span className="n">1</span> Projeler
          </button>
          <span className="step-sep" />
          <button className={`step ${stepState("design")} ${active ? "clickable" : ""}`} onClick={() => active && setPhase("design")}>
            <span className="n">2</span> Tasarım
          </button>
          <span className="step-sep" />
          <button className={`step ${stepState("result")} ${results.length ? "clickable" : ""}`} onClick={() => results.length && setPhase("result")}>
            <span className="n">3</span> Görseller
          </button>
        </nav>
      </header>

      <main className="main">
        {phase === "projects" &&
          (loaded ? (
            <ProjectsHome
              projects={projects}
              onOpen={openProject}
              onNew={startNewProject}
              onRename={renameProject}
              onDuplicate={duplicate}
              onDelete={removeProject}
            />
          ) : (
            <div className="progress-wrap">
              <div className="spinner" />
            </div>
          ))}

        {phase === "design" && active && (
          <StepStyle
            key={active.id}
            projectName={active.name}
            config={config}
            setConfig={setConfig}
            slides={slides}
            setSlides={setSlides}
            saveState={saveState}
            onSaveNow={saveNow}
            onBack={() => setPhase("projects")}
            onGenerate={startGenerateAll}
          />
        )}

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
            onDownloadZip={() => downloadZip(results)}
            zipping={zipping}
            onBack={() => setPhase("design")}
          />
        )}
      </main>

      {/* Yeni proje için ekran görüntüsü seçici */}
      <input ref={newFileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onNewFiles(e.target.files)} />

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
