import { useEffect, useRef, useState } from "react";

import {
  AudioLines,
  Camera,
  CameraOff,
  Disc3,
  Hand,
  Images,
  Maximize,
  Mic,
  Minimize,
  MonitorSpeaker,
  Music,
  Play,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Video,
  Volume2,
} from "lucide-react";

const navigation = [
  { label: "Studio", icon: AudioLines },
  { label: "Library", icon: Music },
  { label: "Karaoke", icon: Mic },
  { label: "Remix", icon: SlidersHorizontal },
  { label: "Artwork", icon: Images },
];

const mediaControls = [
  {
    label: "Connect PC Audio",
    text: "PC Audio",
    icon: MonitorSpeaker,
  },
  {
    label: "Upload Music",
    text: "Music",
    icon: Music,
  },
  {
    label: "Capture Cover",
    text: "Cover",
    icon: Camera,
  },
  {
    label: "Record Video",
    text: "Record",
    icon: Video,
  },
  {
    label: "Gesture control",
    text: "Gestures",
    icon: Hand,
  },
];

const artworkStyles = [
  "Auto",
  "Neon",
  "Monochrome",
  "Vintage",
  "Dreamscape",
  "Lyric",
];

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStageRef = useRef<HTMLElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(
        document.fullscreenElement === cameraStageRef.current &&
          cameraStageRef.current !== null
      );
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  async function toggleFullscreen() {
    const stage = cameraStageRef.current;

    if (!stage) return;

    setFullscreenError("");

    try {
      if (document.fullscreenElement === stage) {
        await document.exitFullscreen();
      } else {
        if (typeof stage.requestFullscreen !== "function") {
          setFullscreenError("Fullscreen is unavailable in this browser.");
          return;
        }

        await stage.requestFullscreen();
      }
    } catch {
      if (mountedRef.current) {
        setFullscreenError(
          "Unable to change fullscreen mode. Please try again."
        );
      }
    }
  }

  async function enableCamera() {
    if (cameraOn || cameraLoading) return;

    setCameraError("");
    setCameraLoading(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is unavailable in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      if (!mountedRef.current || !videoRef.current) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        return;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      setCameraOn(true);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;

      if (!mountedRef.current) return;

      const errorName =
        typeof error === "object" &&
        error !== null &&
        "name" in error
          ? error.name
          : "";

      if (errorName === "NotAllowedError") {
        setCameraError(
          "Camera permission denied. Allow access in your browser settings."
        );
      } else if (errorName === "NotFoundError") {
        setCameraError("No camera was detected.");
      } else {
        setCameraError("Unable to access the camera. Please try again.");
      }
    } finally {
      if (mountedRef.current) {
        setCameraLoading(false);
      }
    }
  }

  function disableCamera() {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setCameraError("");
  }

  return (
    <div className="studio-shell flex min-h-dvh flex-col text-studio-text md:h-dvh md:overflow-hidden">
      {/* Header */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 px-5 py-2 md:px-8">
        <div className="flex items-center gap-3">
          <div className="glass-panel grid size-11 place-items-center rounded-2xl">
            <AudioLines size={24} />
          </div>

          <h1 className="text-xl font-semibold tracking-tight">
            LyricLens{" "}
            <span className="font-light text-studio-muted">AI</span>
          </h1>
        </div>

        <div className="glass-panel flex items-center gap-3 rounded-full px-4 py-2 text-xs text-studio-muted">
          <span className="size-2 rounded-full bg-studio-muted" />
          Local session
        </div>
      </header>

      {/* Workspace */}
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
                aria-current={index === 0 ? "page" : undefined}
                aria-label={label}
                title={label}
                className={`grid size-12 place-items-center rounded-full ${
                  index === 0
                    ? "bg-studio-accent text-studio-bg"
                    : "text-studio-muted"
                }`}
              >
                <Icon size={21} />
              </button>
            ))}
          </nav>
        </aside>

        {/* Main workspace */}
        <main className="flex min-w-0 flex-1 flex-col gap-3 md:overflow-y-auto">
          {/* Studio heading */}
          <div className="shrink-0 px-2">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Live Studio
            </h2>

            <p className="mt-1 text-sm text-studio-muted">
              Don't just listen to music. Become the music.
            </p>
          </div>

          {/* Camera stage */}
          <section
            ref={cameraStageRef}
            aria-label="Camera preview"
            className="camera-stage relative flex min-h-80 flex-1 flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/15 p-6 pt-20 text-center shadow-2xl fullscreen:rounded-none fullscreen:border-0"
          >
            {/* Live webcam video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Live webcam preview"
              className={
                cameraOn
                  ? "absolute inset-0 h-full w-full -scale-x-100 object-contain"
                  : "hidden"
              }
            />

            {/* Viewfinder corners */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-5 z-10"
            >
              <div className="absolute left-0 top-0 size-7 rounded-tl-xl border-l-2 border-t-2 border-white/25" />
              <div className="absolute right-0 top-0 size-7 rounded-tr-xl border-r-2 border-t-2 border-white/25" />
              <div className="absolute bottom-0 left-0 size-7 rounded-bl-xl border-b-2 border-l-2 border-white/25" />
              <div className="absolute bottom-0 right-0 size-7 rounded-br-xl border-b-2 border-r-2 border-white/25" />
            </div>

            {/* Accessible camera status */}
            <span role="status" className="sr-only">
              {cameraOn ? "Camera active" : "Camera inactive"}
            </span>

            {/* Floating camera controls */}
            <div
              role="group"
              aria-label="Camera controls"
              className="absolute right-6 top-6 z-20 flex items-center gap-2"
            >
              {cameraOn && (
                <span
                  aria-hidden="true"
                  title="Camera active"
                  className="mr-1 size-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                />
              )}

              {cameraOn && (
                <button
                  type="button"
                  onClick={disableCamera}
                  aria-label="Disable Camera"
                  title="Turn off camera"
                  className="glass-panel icon-button bg-black/60 hover:bg-red-500/20 hover:text-red-300"
                >
                  <CameraOff size={20} />
                </button>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
                className="glass-panel icon-button bg-black/60"
              >
                {isFullscreen ? (
                  <Minimize size={20} />
                ) : (
                  <Maximize size={20} />
                )}
              </button>
            </div>

            {/* Fullscreen error */}
            {fullscreenError && (
              <p
                role="alert"
                className="absolute bottom-6 z-20 max-w-[90%] rounded-xl bg-black/80 px-4 py-3 text-sm text-red-300"
              >
                {fullscreenError}
              </p>
            )}

            {/* Camera disabled state */}
            {!cameraOn && (
              <>
                <div className="glass-panel mb-4 grid size-16 shrink-0 place-items-center rounded-full">
                  <Camera size={30} strokeWidth={1.5} />
                </div>

                <p className="text-xl font-medium tracking-tight">
                  Your camera is off
                </p>

                <p className="mt-2 text-sm text-studio-muted">
                  Enable your camera to start the live visualizer.
                </p>

                {cameraError && (
                  <p
                    role="alert"
                    className="mt-3 max-w-sm text-sm text-red-300"
                  >
                    {cameraError}
                  </p>
                )}

                <button
                  type="button"
                  disabled={cameraLoading}
                  onClick={enableCamera}
                  className="spatial-button mt-4 shrink-0"
                >
                  <Camera size={17} />
                  {cameraLoading ? "Starting camera..." : "Enable Camera"}
                </button>
              </>
            )}
          </section>

          {/* Artwork style strip */}
          <div className="flex shrink-0 justify-center">
            <div className="glass-panel flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full px-3 py-2">
              <span className="px-2 text-xs font-medium text-studio-muted">
                Style
              </span>

              {artworkStyles.map((style, index) => (
                <button
                  key={style}
                  type="button"
                  disabled={index !== 0}
                  aria-label={`Artwork style ${style}`}
                  title={`${style} style`}
                  className={`rounded-full px-3 py-1.5 text-xs ${
                    index === 0
                      ? "bg-studio-accent text-studio-bg"
                      : "text-studio-muted"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Floating media dock */}
          <div className="flex shrink-0 justify-center pb-1">
            <div
              role="group"
              aria-label="Media controls"
              className="glass-panel flex max-w-full flex-wrap items-center justify-center gap-1 rounded-3xl p-1.5 motion-safe:animate-[spatial-enter_600ms_ease-out_both]"
            >
              {mediaControls.map(({ label, text, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  aria-label={label}
                  title={`${label} — coming soon`}
                  className="flex min-h-12 min-w-16 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-studio-text sm:min-w-20"
                >
                  <Icon size={19} strokeWidth={1.7} />
                  <span className="text-xs font-medium">{text}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Floating music player */}
      <footer className="shrink-0 p-2 md:px-6">
        <div className="glass-panel mx-auto max-w-5xl rounded-3xl px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Track information */}
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-xl bg-white/10">
                <Disc3 size={26} strokeWidth={1.5} />
              </div>

              <div>
                <p className="text-sm font-medium">No track selected</p>

                <p className="text-xs text-studio-muted">
                  Connect an audio source
                </p>
              </div>
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                aria-label="Previous track"
                className="icon-button"
              >
                <SkipBack size={19} />
              </button>

              <button
                type="button"
                disabled
                aria-label="Play"
                className="grid size-12 place-items-center rounded-full bg-studio-accent text-studio-bg"
              >
                <Play size={22} fill="currentColor" />
              </button>

              <button
                type="button"
                disabled
                aria-label="Next track"
                className="icon-button"
              >
                <SkipForward size={19} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 text-studio-muted">
              <Volume2 size={19} />
              <span className="text-xs">0%</span>
            </div>
          </div>

          {/* Playback progress */}
          <div className="mt-3 flex items-center gap-3 text-xs tabular-nums text-studio-muted">
            <span>0:00</span>
            <div className="h-1 flex-1 rounded-full bg-white/15" />
            <span>0:00</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;