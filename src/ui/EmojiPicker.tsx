/* ══════════════════════════════════════════════════════════════════════
   Hafif emoji seçici (bağımlılıksız)
   İkon alanlarında elle emoji yazmak yerine kategorili bir grid'den seç.
   Özel emoji için küçük giriş + "Kaldır" seçeneği de var.
   ══════════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from "react";

const GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Uygulama",
    items: ["🔔", "⏱️", "🔎", "🔍", "📄", "📃", "📌", "📍", "🟢", "🔴", "🟡", "🏷️", "📊", "📈", "📉", "👥", "🧠", "✨", "⭐", "✅", "☑️", "🔒", "🔓", "⚡", "🎯", "📱", "💬", "📥", "📤", "🔥", "💡", "🚀", "⚙️", "🔧", "🛠️", "🧭", "🗂️", "📁", "📅", "🗓️", "⏰", "🔗", "📎", "🧾", "💳", "💰", "🏦", "📢", "🔊", "🛡️"],
  },
  {
    label: "Yüz & el",
    items: ["😀", "😄", "😁", "😉", "😊", "😍", "🤩", "😎", "🤔", "🙂", "😮", "🥳", "🙌", "👏", "👍", "👎", "👌", "🤝", "💪", "🙏", "👀", "🫶", "✌️", "🤞", "👋", "🤙"],
  },
  {
    label: "Semboller",
    items: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💯", "❗", "❓", "➕", "➖", "✔️", "✖️", "🌟", "🌈", "🎉", "🎊", "🏆", "🥇", "🎖️", "💎", "🔑", "🧩", "♾️", "⚠️", "ℹ️"],
  },
  {
    label: "Nesne & yer",
    items: ["📦", "🛒", "🛍️", "🎁", "📸", "🎥", "🎬", "🎧", "🎵", "🖼️", "🗺️", "🌍", "🏠", "🏢", "🏙️", "🚗", "✈️", "⛅", "☀️", "🌙", "⚽", "🏀", "🍔", "☕", "🍿", "🕒"],
  },
];

export function EmojiPicker({ value, onChange }: { value?: string; onChange: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
  };

  return (
    <div className="emoji" ref={ref}>
      <button className="emoji-trigger" onClick={() => setOpen((o) => !o)} title="Emoji seç">
        {value ? <span className="emoji-cur">{value}</span> : <span className="emoji-ph">＋</span>}
        <span className="emoji-lbl">{value ? "Değiştir" : "İkon seç"}</span>
      </button>

      {open && (
        <div className="emoji-pop">
          <div className="emoji-pop-head">
            <input
              type="text"
              value={value ?? ""}
              maxLength={4}
              placeholder="Özel…"
              onChange={(e) => onChange(e.target.value)}
              style={{ width: 90 }}
            />
            <div className="grow" style={{ flex: 1 }} />
            <button className="btn btn-sm btn-ghost" onClick={() => pick("")}>
              Kaldır
            </button>
          </div>
          <div className="emoji-scroll">
            {GROUPS.map((g) => (
              <div key={g.label} className="emoji-group">
                <div className="emoji-group-lbl">{g.label}</div>
                <div className="emoji-grid">
                  {g.items.map((em) => (
                    <button key={em} className={`emoji-cell ${value === em ? "on" : ""}`} onClick={() => pick(em)}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
