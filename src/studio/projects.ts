/* ══════════════════════════════════════════════════════════════════════
   Projeler — taslak çalışmalar
   Her proje = adlandırılmış bir ekran görüntüsü seti + stil config'i.
   localStorage'da saklanır (kişisel/dahili araç). Hazır set (İhaleTakip)
   ilk açılışta varsayılan taslak olarak gelir.
   ══════════════════════════════════════════════════════════════════════ */
import type { StyleConfig } from "./types";
import type { BuiltinSlide } from "./presets";
import { BUILTIN_SLIDES, DEFAULT_CONFIG, APP_NAME, APP_TAGLINE } from "./presets";
import { idbGet, idbSet } from "./store";

export interface Project {
  id: string;
  name: string;
  slides: BuiltinSlide[];
  config: StyleConfig;
  updatedAt: number;
}

const KEY = "sstore.projects.v1";
const uid = () => `proj-${Math.random().toString(36).slice(2, 9)}`;

/** Hazır set (İhaleTakip) — varsayılan taslak */
export function defaultProject(): Project {
  return {
    id: uid(),
    name: APP_NAME,
    slides: BUILTIN_SLIDES.map((s) => ({ ...s })),
    config: {
      ...DEFAULT_CONFIG,
      featureGraphic: { title: APP_NAME, tagline: APP_TAGLINE, kicker: "Kamu İhaleleri", showPhone: true, shotSlideId: null },
    },
    updatedAt: Date.now(),
  };
}

/** Kaydedilmiş bir projenin config'ini güncel şemayla birleştir (eski alanlar için) */
function migrate(p: Project): Project {
  const c = p.config ?? DEFAULT_CONFIG;
  return {
    ...p,
    config: {
      ...DEFAULT_CONFIG,
      ...c,
      background: { ...DEFAULT_CONFIG.background, ...(c.background ?? {}) },
      featureGraphic: { ...DEFAULT_CONFIG.featureGraphic, ...(c.featureGraphic ?? {}) },
    },
  };
}

/** Boş/yeni proje — ekran görüntüleri sonra yüklenir */
export function newProject(name: string, slides: BuiltinSlide[] = []): Project {
  return { id: uid(), name: name.trim() || "Yeni proje", slides, config: { ...DEFAULT_CONFIG }, updatedAt: Date.now() };
}

export function duplicateProject(p: Project): Project {
  return {
    id: uid(),
    name: `${p.name} kopyası`,
    slides: p.slides.map((s) => ({ ...s, overlays: s.overlays ? s.overlays.map((o) => ({ ...o })) : undefined })),
    config: { ...p.config },
    updatedAt: Date.now(),
  };
}

export async function loadProjects(): Promise<Project[]> {
  // 1) IndexedDB (asıl depo — büyük kota)
  try {
    const arr = await idbGet<Project[]>(KEY);
    if (Array.isArray(arr) && arr.length) return arr.map(migrate);
  } catch {
    /* IDB yok/erişilemez */
  }
  // 2) Eski localStorage verisini göç ettir (varsa)
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const arr = JSON.parse(raw) as Project[];
      if (Array.isArray(arr) && arr.length) {
        const migrated = arr.map(migrate);
        idbSet(KEY, migrated).catch(() => {});
        return migrated;
      }
    }
  } catch {
    /* yoksay */
  }
  return [defaultProject()];
}

export async function saveProjects(projects: Project[]): Promise<void> {
  try {
    await idbSet(KEY, projects);
  } catch {
    // IDB başarısızsa localStorage'a dene (küçük projeler için)
    try {
      localStorage.setItem(KEY, JSON.stringify(projects));
    } catch {
      /* kota aşımı — sessizce geç */
    }
  }
}

/** Yüklenen dosyalardan slayt üret */
export function slideFromShot(shot: string, name: string): BuiltinSlide {
  return {
    id: `custom-${Math.random().toString(36).slice(2, 9)}`,
    shot,
    name: name.replace(/\.[^.]+$/, "").slice(0, 24) || "Yeni ekran",
    kicker: "",
    headline: "Başlığı buraya\nyaz.",
    layout: "center",
    tone: "main",
    enabled: true,
  };
}
