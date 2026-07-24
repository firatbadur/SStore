/* ══════════════════════════════════════════════════════════════════════
   Slayt motoru — StyleConfig ile parametrelenen esnek şablonlar
   Tek renderer; layout'a göre kompozisyon değişir. Telefon eğimi, gölge,
   yüzen kartlar, doku, hiza — hepsi config'ten gelir.
   ══════════════════════════════════════════════════════════════════════ */
import type { CSSProperties, ReactNode, Key } from "react";
import type { SlideSpec, StyleConfig, DeviceId } from "./types";
import { surfaceOf, fontStack, type Surface } from "./theme";
import { DEVICES, fitWidth, type Frame } from "./devices";

export interface FloatSpec {
  kind: "pill" | "card";
  icon?: string;
  text?: string;
  title?: string;
  rows?: string[];
}

/* ─── Metin: *vurgu* ve \n satır ayrımı ─── */
function parseHeadline(headline: string, ink: string, accent: string) {
  return headline.split("\n").map((line, li) => {
    const parts = line.split(/(\*[^*]+\*)/g).filter(Boolean);
    return (
      <div key={li}>
        {parts.map((p, pi) => {
          if (p.startsWith("*") && p.endsWith("*")) {
            return (
              <span key={pi} style={{ color: accent }}>
                {p.slice(1, -1)}
              </span>
            );
          }
          // ilk satır bazen daha soluk vurgulanır — burada düz ink
          return (
            <span key={pi} style={{ color: ink }}>
              {p}
            </span>
          );
        })}
      </div>
    );
  });
}

function Texture({ color }: { color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        backgroundImage: `radial-gradient(${color} 1.5px, transparent 1.6px)`,
        backgroundSize: "34px 34px",
        pointerEvents: "none",
      }}
    />
  );
}

function Kicker({ label, cW, s }: { label: string; cW: number; s: Surface }) {
  if (!label) return null;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: cW * 0.014,
        fontFamily: "'Inter', sans-serif",
        fontSize: cW * 0.026,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: s.accent,
      }}
    >
      <span style={{ width: cW * 0.05, height: 2, borderRadius: 2, background: s.accent, display: "inline-block" }} />
      {label}
    </div>
  );
}

function Pill({ cW, s, icon, children, solid }: { cW: number; s: Surface; icon?: string; children: ReactNode; solid?: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: cW * 0.016,
        padding: `${cW * 0.018}px ${cW * 0.03}px`,
        borderRadius: 999,
        background: solid ? s.cardBg : s.pillBg,
        border: `1px solid ${solid ? s.cardBorder : s.pillBorder}`,
        boxShadow: solid ? s.cardShadow : "0 10px 26px -14px rgba(15,23,42,0.35)",
        fontFamily: "'Inter', sans-serif",
        fontSize: cW * 0.026,
        fontWeight: 600,
        color: solid ? s.cardInk : s.pillInk,
        whiteSpace: "nowrap",
      }}
    >
      {icon && <span style={{ fontSize: cW * 0.03, lineHeight: 1 }}>{icon}</span>}
      {children}
    </div>
  );
}

function PopCard({ cW, s, icon, title, rows }: { cW: number; s: Surface; icon?: string; title: string; rows: string[] }) {
  return (
    <div
      style={{
        width: cW * 0.5,
        padding: cW * 0.032,
        borderRadius: cW * 0.045,
        background: s.cardBg,
        border: `1px solid ${s.cardBorder}`,
        boxShadow: s.cardShadow,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: cW * 0.02, marginBottom: cW * 0.022 }}>
        <div style={{ width: cW * 0.062, height: cW * 0.062, borderRadius: cW * 0.018, background: `${s.accent}1F`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: cW * 0.032 }}>
          {icon ?? "•"}
        </div>
        <div style={{ fontSize: cW * 0.03, fontWeight: 700, color: s.cardInk, letterSpacing: "-0.01em" }}>{title}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: cW * 0.016 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: cW * 0.016 }}>
            <span style={{ marginTop: cW * 0.012, width: cW * 0.014, height: cW * 0.014, borderRadius: "50%", background: s.accent, flexShrink: 0 }} />
            <span style={{ fontSize: cW * 0.027, fontWeight: 500, color: s.cardSub, lineHeight: 1.4 }}>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Rating({ cW, s, text }: { cW: number; s: Surface; text: string }) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: cW * 0.01 }}>
      <div style={{ display: "flex", gap: cW * 0.006, fontSize: cW * 0.036, color: "#F5A623" }}>{"★★★★★"}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: cW * 0.024, fontWeight: 600, color: s.sub }}>{text}</div>
    </div>
  );
}

function Phone({
  Frame,
  src,
  alt,
  widthPct,
  rotate,
  shadow,
  style,
}: {
  Frame: Frame;
  src: string;
  alt: string;
  widthPct: number;
  rotate: number;
  shadow: boolean;
  style?: CSSProperties;
}) {
  return (
    <div style={{ position: "absolute", width: `${widthPct}%`, transform: `rotate(${rotate}deg)`, ...style }}>
      {shadow && (
        <div
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            bottom: "-4%",
            height: "16%",
            background: "radial-gradient(50% 100% at 50% 50%, rgba(12,18,32,0.34) 0%, rgba(12,18,32,0) 72%)",
            filter: "blur(24px)",
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1, filter: shadow ? "drop-shadow(0 50px 60px rgba(12,18,32,0.30))" : "none" }}>
        <Frame src={src} alt={alt} />
      </div>
    </div>
  );
}

function Caption({
  cW,
  cH,
  s,
  font,
  kicker,
  headline,
  size,
  align,
  padTop,
}: {
  cW: number;
  cH: number;
  s: Surface;
  font: string;
  kicker: string;
  headline: string;
  size: number;
  align: "center" | "left" | "right";
  padTop: number;
}) {
  const items = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  return (
    <div
      style={{
        position: "absolute",
        top: cH * padTop,
        left: cW * 0.08,
        right: cW * 0.08,
        display: "flex",
        flexDirection: "column",
        alignItems: items,
        textAlign: align,
        gap: cW * 0.026,
        zIndex: 5,
      }}
    >
      <Kicker label={kicker} cW={cW} s={s} />
      <div style={{ fontFamily: font, fontSize: cW * size, lineHeight: 1.04, letterSpacing: "-0.032em", fontWeight: 800 }}>
        {parseHeadline(headline, s.ink, s.accent)}
      </div>
    </div>
  );
}

function Panel({ s, texture, children }: { s: Surface; texture: boolean; children: ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: s.bg }}>
      {texture && <Texture color={s.dots} />}
      {s.glow && <div style={{ position: "absolute", inset: 0, zIndex: 0, background: s.glow }} />}
      <div style={{ position: "relative", zIndex: 2, width: "100%", height: "100%" }}>{children}</div>
    </div>
  );
}

function renderFloat(f: FloatSpec, cW: number, s: Surface, key: Key) {
  if (f.kind === "card") {
    return <PopCard key={key} cW={cW} s={s} icon={f.icon} title={f.title ?? ""} rows={f.rows ?? []} />;
  }
  return (
    <Pill key={key} cW={cW} s={s} solid icon={f.icon}>
      {f.text}
    </Pill>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Tek slayt görünümü
   ══════════════════════════════════════════════════════════════════════ */
export function SlideView({ slide, device, config }: { slide: SlideSpec; device: DeviceId; config: StyleConfig }) {
  const dev = DEVICES[device];
  const cW = dev.designW;
  const cH = dev.designH;
  const Frame = dev.Frame;
  const s = surfaceOf(config.theme, slide.tone, config.accent);
  const font = fontStack(config.font);
  const floats = (slide as SlideSpec & { floats?: FloatSpec[] }).floats ?? [];
  const showFloats = config.floats && floats.length > 0;
  const t = config.tilt;

  if (slide.layout === "finale") {
    return (
      <Panel s={s} texture={config.texture}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: `0 ${cW * 0.09}px`, textAlign: "center", zIndex: 3 }}>
          <Kicker label={slide.kicker} cW={cW} s={s} />
          <div style={{ height: cH * 0.02 }} />
          <div style={{ fontFamily: font, fontSize: cW * 0.086, lineHeight: 1.04, letterSpacing: "-0.032em", fontWeight: 800 }}>
            {parseHeadline(slide.headline, s.ink, s.accent)}
          </div>
          {showFloats && (
            <>
              <div style={{ height: cH * 0.045 }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: cW * 0.022, justifyContent: "center", maxWidth: cW * 0.82 }}>
                {floats.map((f, i) => (
                  <Pill key={i} cW={cW} s={s} icon={f.icon}>
                    {f.text}
                  </Pill>
                ))}
              </div>
            </>
          )}
          <div style={{ height: cH * 0.05 }} />
          <Rating cW={cW} s={s} text="Kullanıcıların ilk tercihi" />
        </div>
      </Panel>
    );
  }

  if (slide.layout === "card") {
    const pw = fitWidth(cW, cH, dev.ratio, 0.56, 0.68) * 100;
    return (
      <Panel s={s} texture={config.texture}>
        <Caption cW={cW} cH={cH} s={s} font={font} kicker={slide.kicker} headline={slide.headline} size={0.08} align={config.align} padTop={0.085} />
        <Phone Frame={Frame} src={slide.shot} alt={slide.name} widthPct={pw} rotate={t * 0.4} shadow={config.shadow} style={{ left: "50%", bottom: "-11%", transform: `translateX(-50%) rotate(${t * 0.4}deg)` }} />
        {showFloats && (
          <div style={{ position: "absolute", top: cH * 0.4, left: cW * 0.06, zIndex: 6 }}>{renderFloat(floats[0], cW, s, 0)}</div>
        )}
      </Panel>
    );
  }

  if (slide.layout === "left") {
    const pw = fitWidth(cW, cH, dev.ratio, 0.66, 0.74) * 100;
    return (
      <Panel s={s} texture={config.texture}>
        <Caption cW={cW} cH={cH} s={s} font={font} kicker={slide.kicker} headline={slide.headline} size={0.076} align="left" padTop={0.085} />
        <Phone Frame={Frame} src={slide.shot} alt={slide.name} widthPct={pw} rotate={t} shadow={config.shadow} style={{ right: "-14%", bottom: "-8%", transform: `rotate(${t}deg)` }} />
        {showFloats && (
          <div style={{ position: "absolute", top: cH * 0.33, left: cW * 0.06, display: "flex", flexDirection: "column", gap: cW * 0.02, zIndex: 6 }}>
            {floats.slice(0, 3).map((f, i) => renderFloat(f, cW, s, i))}
          </div>
        )}
      </Panel>
    );
  }

  if (slide.layout === "right") {
    const pw = fitWidth(cW, cH, dev.ratio, 0.66, 0.74) * 100;
    return (
      <Panel s={s} texture={config.texture}>
        <Caption cW={cW} cH={cH} s={s} font={font} kicker={slide.kicker} headline={slide.headline} size={0.076} align="right" padTop={0.085} />
        <Phone Frame={Frame} src={slide.shot} alt={slide.name} widthPct={pw} rotate={-t} shadow={config.shadow} style={{ left: "-14%", bottom: "-8%", transform: `rotate(${-t}deg)` }} />
        {showFloats && (
          <div style={{ position: "absolute", top: cH * 0.31, right: cW * 0.05, display: "flex", flexDirection: "column", gap: cW * 0.02, alignItems: "flex-end", zIndex: 6 }}>
            {floats.slice(0, 3).map((f, i) => renderFloat(f, cW, s, i))}
          </div>
        )}
      </Panel>
    );
  }

  // center (varsayılan)
  const pw = fitWidth(cW, cH, dev.ratio, 0.6, 0.74) * 100;
  return (
    <Panel s={s} texture={config.texture}>
      <Caption cW={cW} cH={cH} s={s} font={font} kicker={slide.kicker} headline={slide.headline} size={0.084} align={config.align} padTop={0.085} />
      <Phone Frame={Frame} src={slide.shot} alt={slide.name} widthPct={pw} rotate={t * 0.6} shadow={config.shadow} style={{ left: "50%", bottom: "-9%", transform: `translateX(-50%) rotate(${t * 0.6}deg)` }} />
      {showFloats && (
        <>
          <div style={{ position: "absolute", top: cH * 0.42, left: cW * 0.05, zIndex: 6 }}>{renderFloat(floats[0], cW, s, 0)}</div>
          {floats[1] && <div style={{ position: "absolute", top: cH * 0.5, right: cW * 0.04, zIndex: 6 }}>{renderFloat(floats[1], cW, s, 1)}</div>}
        </>
      )}
    </Panel>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Feature Graphic (1024×500 — çerçevesiz banner, uygulama adı metin)
   ══════════════════════════════════════════════════════════════════════ */
export function FeatureGraphicView({ appName, tagline, shot, config }: { appName: string; tagline: string; shot: string; config: StyleConfig }) {
  const dev = DEVICES["feature-graphic"];
  const cW = dev.designW;
  const cH = dev.designH;
  const s = surfaceOf(config.theme, "brand", config.accent);
  const font = fontStack(config.font);
  const t = config.tilt || 8;
  return (
    <Panel s={s} texture={config.texture}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", zIndex: 3 }}>
        <div style={{ paddingLeft: cW * 0.07, width: "58%" }}>
          <Kicker label="Kamu İhaleleri" cW={cW} s={s} />
          <div style={{ height: cH * 0.03 }} />
          <div style={{ fontFamily: font, fontSize: cW * 0.085, fontWeight: 800, color: s.ink, letterSpacing: "-0.03em", lineHeight: 1.0 }}>{appName}</div>
          <div style={{ height: cH * 0.03 }} />
          <div style={{ fontFamily: font, fontSize: cW * 0.042, fontWeight: 600, color: s.sub, letterSpacing: "-0.01em", lineHeight: 1.15 }}>{tagline}</div>
        </div>
        <div style={{ position: "absolute", right: cW * 0.05, top: "50%", transform: "translateY(-50%)" }}>
          <Phone Frame={dev.Frame} src={shot} alt={appName} widthPct={100} rotate={-t} shadow={config.shadow} style={{ position: "relative", width: cW * 0.3, transform: `rotate(${-t}deg)` }} />
        </div>
      </div>
    </Panel>
  );
}

