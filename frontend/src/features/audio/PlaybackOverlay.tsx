
import {
  AudioLines,
  Disc3,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useMusic } from "./musicContext";
import formatTime from "../../utils/formatTime";

export default function PlaybackOverlay() {
  const {
    local,
    pc,
    isPlaying,
    localPlaybackDisabled,
    displayedTrackName,
    displayedSource,
  } = useMusic();

  return (
    <div
      role="group"
      aria-label="Playback controls"
      className="
        pointer-events-none
        relative
        z-20
        mt-auto
        w-full
        shrink-0
        bg-transparent
        px-1
        pb-1
        text-white
        md:px-3
      "
    >
      {/* Main playback row */}
      <div
        className="
          grid
          grid-cols-1
          items-center
          gap-3
          lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
          lg:gap-5
        "
      >
        {/* Left: track information */}
        <div className="flex min-w-0 items-center gap-3">

          <div
            className="
              grid
              size-12
              shrink-0
              place-items-center
              rounded-full
              border
              border-white/30
              bg-black/20
              md:size-16
            "
          >
            {pc.pcConnected ? (
              <AudioLines
                size={28}
                strokeWidth={1.5}
              />
            ) : (
              <Disc3
                size={28}
                strokeWidth={1.5}
                className={
                  isPlaying
                    ? "motion-safe:animate-[spin_8s_linear_infinite]"
                    : ""
                }
              />
            )}
          </div>

          <div className="min-w-0 text-left">
            <p
              title={displayedTrackName}
              className="
                truncate
                text-base
                font-semibold
                drop-shadow-lg
                md:text-xl
              "
            >
              {displayedTrackName}
            </p>

            <p className="text-xs text-white/80 drop-shadow-md md:text-sm">
              {displayedSource}
            </p>
          </div>
        </div>

        {/* Center: playback buttons */}
        <div className="flex items-center justify-center gap-4 md:gap-6">

          <button
            type="button"
            disabled
            aria-label="Previous track"
            title="Previous track — coming soon"
            className="
              pointer-events-auto
              grid
              size-12
              place-items-center
              rounded-full
              text-white/50
              disabled:cursor-not-allowed
              md:size-14
            "
          >
            <SkipBack size={25} />
          </button>

          {/* Large Play/Pause target */}
          <button
            type="button"
            disabled={localPlaybackDisabled}
            onClick={local.togglePlayback}
            aria-label={
              isPlaying ? "Pause" : "Play"
            }
            title={
              pc.pcConnected
                ? "Control playback in the original application"
                : isPlaying
                  ? "Pause"
                  : "Play"
            }
            className="
              pointer-events-auto
              grid
              size-16
              shrink-0
              place-items-center
              rounded-full
              bg-white
              text-studio-bg
              shadow-[0_0_24px_rgba(255,255,255,0.3)]
              transition-colors
              hover:bg-blue-100
              active:bg-blue-200
              disabled:cursor-not-allowed
              disabled:opacity-50
              md:size-20
            "
          >
            {isPlaying ? (
              <Pause
                size={32}
                fill="currentColor"
              />
            ) : (
              <Play
                size={32}
                fill="currentColor"
              />
            )}
          </button>

          <button
            type="button"
            disabled
            aria-label="Next track"
            title="Next track — coming soon"
            className="
              pointer-events-auto
              grid
              size-12
              place-items-center
              rounded-full
              text-white/50
              disabled:cursor-not-allowed
              md:size-14
            "
          >
            <SkipForward size={25} />
          </button>
        </div>

        {/* Right: volume */}
        <div
          className="
            flex
            items-center
            justify-center
            gap-3
            drop-shadow-md
            lg:justify-end
          "
        >
          {local.volume === 0 ? (
            <VolumeX size={21} />
          ) : (
            <Volume2 size={21} />
          )}

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={local.volume}
            disabled={localPlaybackDisabled}
            onChange={local.handleVolumeChange}
            aria-label="Volume"
            className="
              pointer-events-auto
              h-1
              w-20
              cursor-pointer
              accent-white
              disabled:cursor-not-allowed
              xl:w-28
            "
          />

          <span className="w-10 text-right text-xs tabular-nums">
            {pc.pcConnected
              ? "—"
              : `${local.volume}%`}
          </span>
        </div>
      </div>

      {/* Full-width playback timeline */}
      <div
        className="
          mt-4
          flex
          items-center
          gap-3
          text-xs
          tabular-nums
          drop-shadow-md
          md:mt-5
          md:text-sm
        "
      >
        <span className="w-10 shrink-0 text-left">
          {pc.pcConnected
            ? "—:—"
            : formatTime(local.currentTime)}
        </span>

        <input
          type="range"
          min="0"
          max={local.duration || 1}
          step="0.1"
          value={
            !pc.pcConnected &&
            local.duration > 0
              ? Math.min(
                  local.currentTime,
                  local.duration
                )
              : 0
          }
          disabled={
            localPlaybackDisabled ||
            local.duration <= 0
          }
          onChange={local.handleSeek}
          aria-label="Playback position"
          className="
            pointer-events-auto
            h-1
            min-w-0
            flex-1
            cursor-pointer
            accent-white
            disabled:cursor-not-allowed
          "
        />

        <span className="w-10 shrink-0 text-right">
          {pc.pcConnected
            ? "—:—"
            : formatTime(local.duration)}
        </span>
      </div>
    </div>
  );
}
