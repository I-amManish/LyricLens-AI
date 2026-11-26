
import {
  AudioLines,
  Camera,
  Disc3,
  Hand,
  ImagePlus,
  Images,
  Maximize,
  Mic,
  Music,
  Play,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react'

const navigation = [
  { label: 'Studio', icon: AudioLines },
  { label: 'Library', icon: Music },
  { label: 'Karaoke', icon: Mic },
  { label: 'Remix', icon: SlidersHorizontal },
  { label: 'Artwork', icon: Images },
]

function App() {
  return (
    <div className="studio-shell flex min-h-dvh flex-col text-studio-text md:h-dvh md:overflow-hidden">

      {/* Header */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="glass-panel grid size-11 place-items-center rounded-2xl">
            <AudioLines size={24} />
          </div>

          <h1 className="text-xl font-semibold tracking-tight">
            LyricLens <span className="font-light text-studio-muted">AI</span>
          </h1>
        </div>

        <div className="glass-panel flex items-center gap-3 rounded-full px-4 py-2 text-xs text-studio-muted">
          <span className="size-2 rounded-full bg-studio-muted" />
          Local session
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 md:flex-row md:px-6">

        {/* Floating navigation */}
        <aside className="flex shrink-0 items-center justify-center">
          <nav
            aria-label="Studio navigation"
            className="glass-panel flex flex-wrap justify-center gap-2 rounded-3xl p-2 md:flex-col md:rounded-full"
          >
            {navigation.map(({ label, icon: Icon }, index) => (
              <button
                key={label}
                type="button"
                disabled={index !== 0}
                aria-current={index === 0 ? 'page' : undefined}
                aria-label={label}
                title={label}
                className={`grid size-12 place-items-center rounded-full ${
                  index === 0
                    ? 'bg-studio-accent text-studio-bg'
                    : 'text-studio-muted'
                }`}
              >
                <Icon size={21} />
              </button>
            ))}
          </nav>
        </aside>

        {/* Main workspace */}
        <main className="flex min-w-0 flex-1 flex-col gap-4 md:overflow-y-auto">

          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Live Studio
              </h2>

              <p className="mt-1 text-sm text-studio-muted">
                Don't just listen to music. Become the music.
              </p>
            </div>

            <button
              disabled
              aria-label="Fullscreen"
              className="glass-panel icon-button shrink-0"
            >
              <Maximize size={18} />
            </button>
          </div>

          {/* Camera stage */}
          <section
            aria-label="Camera preview"
            className="camera-stage relative flex min-h-64 flex-1 flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/15 p-6 text-center shadow-2xl"
          >
            {/* Viewfinder corners */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-5"
            >
              <div className="absolute left-0 top-0 size-7 rounded-tl-xl border-l-2 border-t-2 border-white/25" />

              <div className="absolute right-0 top-0 size-7 rounded-tr-xl border-r-2 border-t-2 border-white/25" />

              <div className="absolute bottom-0 left-0 size-7 rounded-bl-xl border-b-2 border-l-2 border-white/25" />

              <div className="absolute bottom-0 right-0 size-7 rounded-br-xl border-b-2 border-r-2 border-white/25" />
            </div>

            <div className="absolute left-8 top-8 flex items-center gap-2 text-xs text-studio-muted">
              <span className="size-2 rounded-full bg-studio-muted" />
              Standby
            </div>

            <div className="glass-panel mb-5 grid size-20 place-items-center rounded-full">
              <Camera size={32} strokeWidth={1.5} />
            </div>

            <p className="text-xl font-medium tracking-tight">
              Your camera is off
            </p>

            <p className="mt-2 text-sm text-studio-muted">
              Enable your camera to start the live visualizer.
            </p>

            <button
              type="button"
              disabled
              className="spatial-button mt-6"
            >
              <Camera size={17} />
              Enable Camera
            </button>
          </section>

          {/* Camera status */}
          <div className="flex flex-wrap items-center justify-center gap-4 pb-2">
            <div className="glass-panel flex items-center gap-2 rounded-full px-4 py-3 text-xs text-studio-muted">
              <Camera size={16} />
              Camera off
            </div>

            <div className="glass-panel flex items-center gap-2 rounded-full px-4 py-3 text-xs text-studio-muted">
              <Hand size={16} />
              Gestures off
            </div>
          </div>
        </main>

        {/* Media panel */}
        <aside className="glass-panel flex shrink-0 flex-col gap-4 rounded-3xl p-4 md:w-56 lg:w-64 md:overflow-y-auto">

          <h2 className="text-sm font-semibold">
            Your session
          </h2>

          <button
            type="button"
            disabled
            className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/25 bg-black/15 p-4"
          >
            <ImagePlus size={30} strokeWidth={1.5} />

            <span className="text-sm font-medium">
              Upload Image
            </span>

            <span
              aria-hidden="true"
              className="text-xs text-studio-muted"
            >
              Artwork or reference
            </span>
          </button>

          <button
            type="button"
            disabled
            className="flex min-h-11 items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 text-sm"
          >
            <Music size={18} />
            Upload Music
          </button>

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-studio-muted">
              No media loaded
            </p>
          </div>
        </aside>
      </div>

      {/* Floating music player */}
      <footer className="shrink-0 p-4 md:px-6">
        <div className="glass-panel mx-auto max-w-5xl rounded-3xl px-5 py-3">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-xl bg-white/10">
                <Disc3 size={26} strokeWidth={1.5} />
              </div>

              <div>
                <p className="text-sm font-medium">
                  No track selected
                </p>

                <p className="text-xs text-studio-muted">
                  Your music library
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled
                aria-label="Previous track"
                className="icon-button"
              >
                <SkipBack size={19} />
              </button>

              <button
                disabled
                aria-label="Play"
                className="grid size-12 place-items-center rounded-full bg-studio-accent text-studio-bg"
              >
                <Play size={22} fill="currentColor" />
              </button>

              <button
                disabled
                aria-label="Next track"
                className="icon-button"
              >
                <SkipForward size={19} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-studio-muted">
              <Volume2 size={19} />
              <span className="text-xs">0%</span>
            </div>

          </div>

          <div className="mt-3 flex items-center gap-3 text-xs tabular-nums text-studio-muted">
            <span>0:00</span>
            <div className="h-1 flex-1 rounded-full bg-white/15" />
            <span>0:00</span>
          </div>

        </div>
      </footer>
    </div>
  )
}

export default App
