import { useEffect, useRef, useState, type ReactNode } from "react";

/** designW×designH tam boy içeriği, kapsayıcı genişliğine göre ölçekleyerek gösterir */
export function SlidePreview({ designW, designH, children, radius }: { designW: number; designH: number; children: ReactNode; radius?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.12);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setScale(e.contentRect.width / designW));
    obs.observe(el);
    return () => obs.disconnect();
  }, [designW]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        aspectRatio: `${designW} / ${designH}`,
        overflow: "hidden",
        borderRadius: radius ?? 0,
        position: "relative",
      }}
    >
      <div style={{ width: designW, height: designH, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}
