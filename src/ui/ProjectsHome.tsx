/* ══════════════════════════════════════════════════════════════════════
   Proje başlatıcı (ilk ekran)
   Taslakları listeler, yeni proje açar. Burada düzenleme yok — bir projeye
   tıklamak onu açar ve Tasarım sayfasına geçer.
   ══════════════════════════════════════════════════════════════════════ */
import type { Project } from "../studio/projects";
import { SlideView } from "../studio/slides";
import { SlidePreview } from "./SlidePreview";

export function ProjectsHome({
  projects,
  onOpen,
  onNew,
  onRename,
  onDuplicate,
  onDelete,
}: {
  projects: Project[];
  onOpen: (id: string) => void;
  onNew: () => void;
  onRename: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <div className="page-head">
        <h1>Projeler</h1>
        <p>Bir taslağı aç ya da yeni proje oluştur. Ekran görüntüleri, metinler ve tasarım proje açıldıktan sonra düzenlenir.</p>
      </div>

      <div className="proj-grid">
        <div className="proj-new" onClick={onNew}>
          <div className="plus">＋</div>
          <div className="t">Yeni proje</div>
          <div className="s">Ekran görüntülerini yükle, tasarla</div>
        </div>

        {projects.map((p) => {
          const first = p.slides.find((s) => s.enabled && s.shot) ?? p.slides.find((s) => s.shot) ?? p.slides[0] ?? null;
          const count = p.slides.filter((s) => s.enabled).length;
          return (
            <div key={p.id} className="proj-card">
              <div className="proj-thumb" onClick={() => onOpen(p.id)} title="Aç">
                {first ? (
                  <SlidePreview designW={1320} designH={2868}>
                    <SlideView slide={first} device="iphone" config={p.config} />
                  </SlidePreview>
                ) : (
                  <div className="proj-thumb-empty">Boş proje</div>
                )}
              </div>
              <div className="proj-meta">
                <div className="proj-name">{p.name}</div>
                <div className="proj-sub">{count} ekran</div>
                <div className="proj-actions">
                  <button className="btn btn-sm btn-primary" onClick={() => onOpen(p.id)}>
                    Aç →
                  </button>
                  <div className="grow" style={{ flex: 1 }} />
                  <button className="iconbtn" title="Yeniden adlandır" onClick={() => onRename(p.id)}>
                    ✎
                  </button>
                  <button className="iconbtn" title="Kopyala" onClick={() => onDuplicate(p.id)}>
                    ⧉
                  </button>
                  <button className="iconbtn" title="Sil" onClick={() => onDelete(p.id)}>
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
