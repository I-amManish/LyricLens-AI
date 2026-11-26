
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import {
  AudioLines,
  Camera,
  CameraOff,
  Captions,
  Disc3,
  Hand,
  Images,
  Maximize,
  Mic,
  Minimize,
  MonitorSpeaker,
  Music,
  Palette,
  Pause,
  Play,
  Plus,
  Scan,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Video,
  Volume2,
  VolumeX,
  WandSparkles,
} from "lucide-react";

// Left navigation toolbar
const navigation = [
  { label: "Studio", icon: AudioLines },
  { label: "Library", icon: Music },
  { label: "Karaoke", icon: Mic },
  { label: "Remix", icon: SlidersHorizontal },
  { label: "Artwork", icon: Images },
];

// Right AI creative toolbar
const creativeTools = [
  { label: "Auto AI", icon: Sparkles },
  { label: "Artwork styles", icon: Palette },
  { label: "Lyrics", icon: Captions },
  { label: "AI effects", icon: WandSparkles },
  { label: "Body tracking", icon: Scan },
];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function App() {
  // Camera references
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStageRef = useRef<HTMLElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(false);

  // Music references
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const musicUrlRef = useRef<string | null>(null);

  // Camera state
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");

  // Music state
  const [trackName, setTrackName] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [musicError, setMusicError] = useState("");

  // Release resources on unmount
  useEffect(() => {
    mountedRef.current = true;

    const audio = audioRef.current;

    return () => {
      mountedRef.current = false;

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;

      if (musicUrlRef.current) {
        if (audio && !audio.paused) {
          audio.pause();
        }

        URL.revokeObjectURL(musicUrlRef.current);

        musicUrlRef.current = null;
      }
    };
  }, []);

  // Synchronize fullscreen state
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(
        document.fullscreenElement === cameraStageRef.current &&
          cameraStageRef.current !== null
      );
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // Enter or exit fullscreen
  async function toggleFullscreen() {
    const stage = cameraStageRef.current;

    if (!stage) return;

    setFullscreenError("");

    try {
      if (document.fullscreenElement === stage) {
        await document.exitFullscreen();
      } else {
        if (typeof stage.requestFullscreen !== "function") {
          setFullscreenError(
            "Fullscreen is unavailable in this browser."
          );

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

  // Enable webcam
  async function enableCamera() {
    if (cameraOn || cameraLoading) return;

    setCameraError("");
    setCameraLoading(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera access is unavailable in this browser."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
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
        setCameraError(
          "Unable to access the camera. Please try again."
        );
      }
    } finally {
      if (mountedRef.current) {
        setCameraLoading(false);
      }
    }
  }

  // Disable webcam
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

  // Open local music selector
  function openMusicSelector() {
    musicInputRef.current?.click();
  }

  // Start audio playback
  async function playMusic(
    audio: HTMLAudioElement,
    activeUrl: string
  ) {
    setMusicError("");

    try {
      await audio.play();
    } catch {
      if (
        mountedRef.current &&
        musicUrlRef.current === activeUrl
      ) {
        setIsPlaying(false);

        setMusicError(
          "Unable to start playback. Press Play to try again."
        );
      }
    }
  }

  // Load music and autoplay replacement tracks
  function handleMusicSelection(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    const audio = audioRef.current;

    if (!file || !audio) return;

    event.target.value = "";

    if (file.type && !file.type.startsWith("audio/")) {
      setMusicError("Please select a supported audio file.");
      return;
    }

    const previousUrl = musicUrlRef.current;
    const newUrl = URL.createObjectURL(file);

    const shouldAutoplay = previousUrl !== null;

    if (previousUrl) {
      audio.pause();
    }

    musicUrlRef.current = newUrl;

    audio.src = newUrl;

    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    // Preserve the current volume
    audio.volume = volume / 100;

    setTrackName(
      file.name.replace(/\.[^.]+$/, "")
    );

    setMusicUrl(newUrl);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setMusicError("");

    if (shouldAutoplay) {
      void playMusic(audio, newUrl);
    }
  }

  // Toggle playback
  async function togglePlayback() {
    const audio = audioRef.current;
    const activeUrl = musicUrlRef.current;

    if (!audio || !activeUrl) return;

    setMusicError("");

    if (isPlaying) {
      audio.pause();
      return;
    }

    await playMusic(audio, activeUrl);
  }

  // Synchronize playback duration
  function handleLoadedMetadata() {
    const audio = audioRef.current;

    if (!audio) return;

    setDuration(
      Number.isFinite(audio.duration)
        ? audio.duration
        : 0
    );
  }

  // Synchronize playback position
  function handleTimeUpdate() {
    const audio = audioRef.current;

    if (!audio) return;

    setCurrentTime(audio.currentTime);
  }

  // Seek music
  function handleSeek(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const audio = audioRef.current;

    if (!audio || duration <= 0) return;

    const position = Number(event.target.value);

    audio.currentTime = position;

    setCurrentTime(position);
  }

  // Adjust volume
  function handleVolumeChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const newVolume = Number(event.target.value);

    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  }

  // Handle playback completion
  function handleMusicEnded() {
    setIsPlaying(false);
  }

  // Handle audio errors
  function handleMusicError() {
    if (!musicUrlRef.current) return;

    setIsPlaying(false);

    setMusicError(
      "This audio file could not be loaded."
    );
  }

  return (
    <div className="studio-shell flex min-h-dvh flex-col text-studio-text md:h-dvh md:overflow-hidden">

      {/* Hidden music file selector */}
      <input
        ref={musicInputRef}
        type="file"
        accept="audio/*"
        aria-label="Select music file"
        onChange={handleMusicSelection}
        className="hidden"
      />

      {/* Local audio engine */}
      <audio
        ref={audioRef}
        aria-label="Music audio"
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleMusicEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={handleMusicError}
      />

      {/* Application header */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-5 py-2 md:px-8">

        {/* Branding */}
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

        {/* Header controls */}
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

      {/* Dual toolbar workspace */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 md:flex-row md:px-6">

        {/* LEFT: Navigation toolbar */}
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
                aria-current={
                  index === 0 ? "page" : undefined
                }
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

        {/* CENTER: Live workspace */}
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
            className="camera-stage relative flex min-h-80 flex-1 flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/15 px-6 py-16 text-center shadow-2xl fullscreen:rounded-none fullscreen:border-0"
          >

            {/* Live webcam */}
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
              {cameraOn
                ? "Camera active"
                : "Camera inactive"}
            </span>

            {/* Upper-right camera controls */}
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
                  className="glass-panel icon-button bg-black/60 hover:text-red-300"
                >
                  <CameraOff size={20} />
                </button>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={
                  isFullscreen
                    ? "Exit fullscreen"
                    : "Fullscreen"
                }
                title={
                  isFullscreen
                    ? "Exit fullscreen (Esc)"
                    : "Enter fullscreen"
                }
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
                className="absolute left-6 top-6 z-30 max-w-[45%] rounded-xl bg-black/80 px-3 py-2 text-sm text-red-300"
              >
                {fullscreenError}
              </p>
            )}

            {/* Camera disabled state */}
            {!cameraOn && (
              <>
                <div className="glass-panel mb-3 grid size-16 shrink-0 place-items-center rounded-full">
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

                  {cameraLoading
                    ? "Starting camera..."
                    : "Enable Camera"}
                </button>
              </>
            )}

            {/* Bottom-right capture controls */}
            <div
              role="group"
              aria-label="Artwork capture controls"
              className="glass-panel absolute bottom-6 right-6 z-20 flex items-center gap-1 rounded-full p-1"
            >
              <button
                type="button"
                disabled
                aria-label="Capture Cover"
                title="Capture artwork — coming soon"
                className="icon-button"
              >
                <Camera size={20} />
              </button>

              <div
                aria-hidden="true"
                className="h-5 w-px bg-white/15"
              />

              <button
                type="button"
                disabled
                aria-label="Record Video"
                title="Record performance — coming soon"
                className="icon-button"
              >
                <Video size={20} />
              </button>
            </div>
          </section>
        </main>

        {/* RIGHT: AI creative toolbar */}
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
      </div>

      {/* Floating music player */}
      <footer className="shrink-0 p-2 md:px-6">
        <div className="glass-panel mx-auto max-w-6xl rounded-3xl px-4 py-3 sm:px-5">

          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Track information */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10">
                <Disc3
                  size={26}
                  strokeWidth={1.5}
                  className={
                    isPlaying
                      ? "motion-safe:animate-[spin_8s_linear_infinite]"
                      : ""
                  }
                />
              </div>

              <div className="min-w-0">
                <p
                  title={trackName || "No track selected"}
                  className="truncate text-sm font-medium"
                >
                  {trackName || "No track selected"}
                </p>

                <p className="text-xs text-studio-muted">
                  {musicUrl
                    ? "Local music"
                    : "Connect an audio source"}
                </p>
              </div>
            </div>

            {/* Playback controls */}
            <div className="flex shrink-0 items-center gap-1">

              <button
                type="button"
                disabled
                aria-label="Previous track"
                title="Previous track — coming soon"
                className="icon-button"
              >
                <SkipBack size={19} />
              </button>

              <button
                type="button"
                disabled={!musicUrl}
                onClick={togglePlayback}
                aria-label={isPlaying ? "Pause" : "Play"}
                title={isPlaying ? "Pause" : "Play"}
                className="grid size-12 place-items-center rounded-full bg-studio-accent text-studio-bg"
              >
                {isPlaying ? (
                  <Pause size={22} fill="currentColor" />
                ) : (
                  <Play size={22} fill="currentColor" />
                )}
              </button>

              <button
                type="button"
                disabled
                aria-label="Next track"
                title="Next track — coming soon"
                className="icon-button"
              >
                <SkipForward size={19} />
              </button>
            </div>

            {/* Audio sources */}
            <div
              role="group"
              aria-label="Audio sources"
              className="flex shrink-0 items-center gap-2"
            >

              <button
                type="button"
                disabled
                aria-label="Connect PC Audio"
                title="PC audio connection — coming soon"
                className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 text-xs"
              >
                <MonitorSpeaker size={18} />

                <span className="hidden lg:inline">
                  PC Audio
                </span>
              </button>

              <button
                type="button"
                onClick={openMusicSelector}
                aria-label="Upload Music"
                title="Select a local music file"
                className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-xs hover:bg-white/15"
              >
                <Plus size={18} />

                <span>Add music</span>
              </button>
            </div>

            {/* Volume control */}
            <div className="flex shrink-0 items-center gap-2 text-studio-muted">
              {volume === 0 ? (
                <VolumeX size={19} />
              ) : (
                <Volume2 size={19} />
              )}

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={volume}
                disabled={!musicUrl}
                onChange={handleVolumeChange}
                aria-label="Volume"
                className="h-1 w-16 cursor-pointer accent-studio-accent disabled:cursor-not-allowed sm:w-20"
              />

              <span className="w-9 text-right text-xs tabular-nums">
                {volume}%
              </span>
            </div>
          </div>

          {/* Playback progress */}
          <div className="mt-3 flex items-center gap-3 text-xs tabular-nums text-studio-muted">

            <span className="w-10 shrink-0">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.1"
              value={
                duration > 0
                  ? Math.min(currentTime, duration)
                  : 0
              }
              disabled={!musicUrl || duration <= 0}
              onChange={handleSeek}
              aria-label="Playback position"
              className="h-1 min-w-0 flex-1 cursor-pointer accent-studio-accent disabled:cursor-not-allowed"
            />

            <span className="w-10 shrink-0 text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Audio error */}
          {musicError && (
            <p
              role="alert"
              className="mt-2 text-center text-xs text-red-300"
            >
              {musicError}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;
