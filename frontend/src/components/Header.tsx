
import { AudioLines, Hand } from "lucide-react";

export default function Header() {
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-5 py-2 md:px-8">
      <div className="flex items-center gap-3">
        <div className="glass-panel grid size-11 place-items-center rounded-2xl">
          <AudioLines size={24} />
        </div>

        <h1 className="text-xl font-semibold tracking-tight">
          LyricLens{" "}
          <span className="font-light text-studio-muted">
            AI
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled
          aria-label="Gesture control"
          title="AI gesture control — coming soon"
          className="glass-panel flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm"
        >
          <Hand size={18} />

          <span className="hidden sm:inline">
            Gestures
          </span>
        </button>

        <div className="glass-panel hidden items-center gap-2 rounded-full px-4 py-2 text-xs text-studio-muted sm:flex">
          <span className="size-2 rounded-full bg-studio-muted" />
          Local session
        </div>
      </div>
    </header>
  );
}
