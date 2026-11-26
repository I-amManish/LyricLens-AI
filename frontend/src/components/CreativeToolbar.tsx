
import {
  Sparkles,
  Palette,
  Captions,
  WandSparkles,
  Scan,
} from "lucide-react";

const creativeTools = [
  { label: "Auto AI", icon: Sparkles },
  { label: "Artwork styles", icon: Palette },
  { label: "Lyrics", icon: Captions },
  { label: "AI effects", icon: WandSparkles },
  { label: "Body tracking", icon: Scan },
];

export default function CreativeToolbar() {
  return (
    <aside
      aria-label="AI creative tools"
      className="flex shrink-0 items-center justify-center"
    >
      <div
        role="group"
        aria-label="Creative controls"
        className="glass-panel flex flex-wrap justify-center gap-2 rounded-3xl p-2 md:flex-col md:rounded-full motion-safe:animate-[spatial-enter_600ms_ease-out_both]"
      >
        {creativeTools.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            disabled
            aria-label={label}
            title={`${label} — coming soon`}
            className="grid size-12 place-items-center rounded-full text-studio-muted"
          >
            <Icon size={21} />
          </button>
        ))}
      </div>
    </aside>
  );
}
