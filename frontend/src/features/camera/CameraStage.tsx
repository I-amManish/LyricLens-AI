
import { useEffect } from "react";

import {
  Camera,
  CameraOff,
  Maximize,
  Minimize,
  Video,
} from "lucide-react";

import useCamera from "./useCamera";

import MusicPlayer from "../audio/MusicPlayer";
import PlaybackOverlay from "../audio/PlaybackOverlay";

import {
  useGestures,
} from "../gestures/gestureContext";

export default function CameraStage() {
  const {
    videoRef,
    cameraStageRef,
    cameraOn,
    cameraLoading,
    cameraError,
    isFullscreen,
    fullscreenError,
    enableCamera,
    disableCamera,
    toggleFullscreen,
  } = useCamera();

  const { registerVideo } = useGestures();

  // Share the existing webcam with
  // the gesture tracking engine.
  useEffect(() => {
    registerVideo(
      cameraOn
        ? videoRef.current
        : null
    );

    return () => {
      registerVideo(null);
    };
  }, [
    cameraOn,
    videoRef,
    registerVideo,
  ]);

  return (
    <section
      ref={cameraStageRef}
      aria-label="Camera preview"
      className="
        camera-stage
        relative
        flex
        min-h-[28rem]
        w-full
        flex-1
        flex-col
        overflow-hidden
        rounded-[28px]
        border
        border-white/15
        p-4
        text-center
        shadow-2xl
        md:min-h-[24rem]
        md:p-6
        fullscreen:rounded-none
        fullscreen:border-0
      "
    >
      {/* Live webcam preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-label="Live webcam preview"
        className={
          cameraOn
            ? "absolute inset-0 h-full w-full -scale-x-100 object-cover"
            : "hidden"
        }
      />

      {/* Viewfinder corners */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 z-10"
      >
        <div className="absolute left-0 top-0 size-7 rounded-tl-xl border-l-2 border-t-2 border-white/25" />

        <div className="absolute right-0 top-0 size-7 rounded-tr-xl border-r-2 border-t-2 border-white/25" />

        <div className="absolute bottom-0 left-0 size-7 rounded-bl-xl border-b-2 border-l-2 border-white/25" />

        <div className="absolute bottom-0 right-0 size-7 rounded-br-xl border-b-2 border-r-2 border-white/25" />
      </div>

      {/* Accessible camera status */}
      <span
        role="status"
        className="sr-only"
      >
        {cameraOn
          ? "Camera active"
          : "Camera inactive"}
      </span>

      {/* Integrated top toolbar */}
      <div
        className="
          relative
          z-30
          flex
          shrink-0
          flex-wrap
          items-start
          justify-between
          gap-3
        "
      >
        {/* Top-left: audio sources */}
        <div className="min-w-0 flex-1">
          <MusicPlayer />
        </div>

        {/* Top-right: camera and artwork controls */}
        <div
          className="
            ml-auto
            flex
            shrink-0
            flex-col
            items-end
            gap-2
          "
        >
          {/* Camera controls */}
          <div
            role="group"
            aria-label="Camera controls"
            className="flex items-center gap-2"
          >
            {cameraOn && (
              <span
                aria-hidden="true"
                title="Camera active"
                className="
                  mr-1
                  size-2.5
                  rounded-full
                  bg-emerald-400
                  shadow-[0_0_8px_rgba(52,211,153,0.4)]
                "
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
              data-gesture-disabled="true"
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

          {/* Artwork and recording controls */}
          <div
            role="group"
            aria-label="Artwork capture controls"
            className="
              glass-panel
              flex
              items-center
              gap-1
              rounded-full
              p-1
            "
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
        </div>
      </div>

      {/* Fullscreen errors */}
      {fullscreenError && (
        <p
          role="alert"
          className="
            relative
            z-30
            mt-3
            self-center
            rounded-xl
            bg-black/80
            px-3
            py-2
            text-sm
            text-red-300
          "
        >
          {fullscreenError}
        </p>
      )}

      {/* Main live camera workspace */}
      <div
        className="
          relative
          flex
          min-h-0
          flex-1
          flex-col
          items-center
          justify-center
          py-4
        "
      >
        {!cameraOn && (
          <>
            <div className="glass-panel mb-3 grid size-16 shrink-0 place-items-center rounded-full">
              <Camera
                size={30}
                strokeWidth={1.5}
              />
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
              data-gesture-disabled="true"
              className="spatial-button mt-4 shrink-0"
            >
              <Camera size={17} />

              {cameraLoading
                ? "Starting camera..."
                : "Enable Camera"}
            </button>
          </>
        )}
      </div>

      {/* Completely transparent playback overlay */}
      <PlaybackOverlay />
    </section>
  );
}
