
import {
  AudioLines,
  Hand,
  LoaderCircle,
} from "lucide-react";

import {
  useGestures,
} from "../features/gestures/gestureContext";

export default function Header() {
  const {
    enabled,
    cameraReady,
    status,
    error,
    toggleGestures,
  } = useGestures();

  let gestureLabel = "Gestures";
  let gestureColor = "text-studio-muted";

  if (enabled) {
    if (!cameraReady) {
      gestureLabel = "Waiting for camera";
      gestureColor = "text-amber-300";
    } else if (status === "loading") {
      gestureLabel = "Loading AI...";
      gestureColor = "text-amber-300";
    } else if (status === "tracking") {
      gestureLabel = "Gestures active";
      gestureColor = "text-emerald-300";
    } else if (status === "error") {
      gestureLabel = "Tracking error";
      gestureColor = "text-red-300";
    } else {
      gestureLabel = "Gestures paused";
      gestureColor = "text-amber-300";
    }
  }

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-5 py-2 md:px-8">
      {/* Application branding */}
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
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggleGestures}
          aria-label="Gesture control"
          aria-pressed={enabled}
          title={
            enabled
              ? "Disable AI gesture control"
              : "Enable AI gesture control"
          }
          className={`
            glass-panel
            flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-full
            px-4
            text-sm
            ${gestureColor}
          `}
        >
          {enabled && status === "loading" ? (
            <LoaderCircle
              size={18}
              className="motion-safe:animate-spin"
            />
          ) : (
            <Hand size={18} />
          )}

          <span
            className={
              enabled
                ? "inline"
                : "hidden sm:inline"
            }
          >
            {gestureLabel}
          </span>
        </button>

        <div className="glass-panel hidden items-center gap-2 rounded-full px-4 py-2 text-xs text-studio-muted sm:flex">
          <span className="size-2 rounded-full bg-studio-muted" />

          Local session
        </div>
      </div>

      {/* Gesture model errors */}
      {enabled && error && (
        <p
          role="alert"
          className="w-full text-right text-xs text-red-300"
        >
          {error}
        </p>
      )}
    </header>
  );
}
