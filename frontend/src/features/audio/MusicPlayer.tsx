
import {
  AudioLines,
  Disc3,
  MonitorSpeaker,
  Pause,
  Play,
  Plus,
  SkipBack,
  SkipForward,
  Unplug,
  Volume2,
  VolumeX,
} from "lucide-react";

import useMusicPlayer from "./useMusicPlayer";
import usePcAudio from "./usePcAudio";
import formatTime from "../../utils/formatTime";

export default function MusicPlayer() {
  // Local music state, refs and actions
  const {
    audioRef,
    musicInputRef,
    trackName,
    musicUrl,
    isPlaying: localIsPlaying,
    currentTime,
    duration,
    volume,
    musicError,
    openMusicSelector,
    pausePlayback,
    togglePlayback,
    handleMusicSelection,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleSeek,
    handleVolumeChange,
    handlePlay,
    handlePause,
    handleMusicError,
  } = useMusicPlayer();

  // PC audio state and actions
  const {
    pcConnected,
    pcLoading,
    pcError,
    connectPcAudio,
    disconnectPcAudio,
  } = usePcAudio();

  // Derived playback state
  const localPlaybackDisabled =
    !musicUrl || pcConnected || pcLoading;

  const isPlaying =
    localIsPlaying && !pcConnected;

  const displayedTrackName = pcConnected
    ? "PC Audio"
    : trackName || "No track selected";

  const displayedSource = pcConnected
    ? "External audio connected"
    : musicUrl
      ? "Local music"
      : "Connect an audio source";

  // Switch external audio connection
  function togglePcAudio() {
    if (pcConnected) {
      disconnectPcAudio();
    } else {
      void connectPcAudio(pausePlayback);
    }
  }

  return (
    <footer className="shrink-0 p-2 md:px-6">

      {/* Hidden local music selector */}
      <input
        ref={musicInputRef}
        type="file"
        accept="audio/*"
        aria-label="Select music file"
        className="hidden"
        onChange={(event) =>
          handleMusicSelection(
            event,
            disconnectPcAudio
          )
        }
      />

      {/* Local audio engine */}
      <audio
        ref={audioRef}
        aria-label="Music audio"
        preload="metadata"
        onPlay={() => {
          if (pcConnected) {
            pausePlayback();
          } else {
            handlePlay();
          }
        }}
        onPause={handlePause}
        onEnded={handlePause}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={handleMusicError}
      />

      {/* Floating glass music player */}
      <div className="glass-panel mx-auto max-w-6xl rounded-3xl px-4 py-3 sm:px-5">

        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* Track information */}
          <div className="flex min-w-0 flex-1 items-center gap-3">

            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10">
              {pcConnected ? (
                <AudioLines
                  size={26}
                  strokeWidth={1.5}
                />
              ) : (
                <Disc3
                  size={26}
                  strokeWidth={1.5}
                  className={
                    isPlaying
                      ? "motion-safe:animate-[spin_8s_linear_infinite]"
                      : ""
                  }
                />
              )}
            </div>

            <div className="min-w-0">
              <p
                title={displayedTrackName}
                className="truncate text-sm font-medium"
              >
                {displayedTrackName}
              </p>

              <p className="text-xs text-studio-muted">
                {displayedSource}
              </p>
            </div>
          </div>

          {/* Local playback controls */}
          <div className="flex shrink-0 items-center gap-1">

            {/* Previous track */}
            <button
              type="button"
              disabled
              aria-label="Previous track"
              title="Previous track — coming soon"
              className="icon-button"
            >
              <SkipBack size={19} />
            </button>

            {/* Play and pause */}
            <button
              type="button"
              disabled={localPlaybackDisabled}
              onClick={togglePlayback}
              aria-label={
                isPlaying ? "Pause" : "Play"
              }
              title={
                pcConnected
                  ? "Control playback in the original application"
                  : isPlaying
                    ? "Pause"
                    : "Play"
              }
              className="grid size-12 place-items-center rounded-full bg-studio-accent text-studio-bg"
            >
              {isPlaying ? (
                <Pause
                  size={22}
                  fill="currentColor"
                />
              ) : (
                <Play
                  size={22}
                  fill="currentColor"
                />
              )}
            </button>

            {/* Next track */}
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

          {/* Audio source controls */}
          <div
            role="group"
            aria-label="Audio sources"
            className="flex shrink-0 items-center gap-2"
          >

            {/* PC audio connection */}
            <button
              type="button"
              disabled={pcLoading}
              onClick={togglePcAudio}
              aria-label={
                pcConnected
                  ? "Disconnect PC Audio"
                  : "Connect PC Audio"
              }
              aria-busy={pcLoading}
              title={
                pcConnected
                  ? "Disconnect PC audio"
                  : "Connect authorized system audio"
              }
              className={`flex min-h-11 items-center justify-center gap-2 rounded-full border px-3 text-xs font-medium ${
                pcConnected
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-white/15 bg-white/5 hover:bg-white/10"
              }`}
            >
              {pcConnected ? (
                <Unplug size={18} />
              ) : (
                <MonitorSpeaker size={18} />
              )}

              <span className="hidden lg:inline">
                {pcLoading
                  ? "Connecting..."
                  : pcConnected
                    ? "Disconnect"
                    : "PC Audio"}
              </span>
            </button>

            {/* Local music selection */}
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

          {/* Local volume control */}
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
              disabled={localPlaybackDisabled}
              onChange={handleVolumeChange}
              aria-label="Volume"
              className="h-1 w-16 cursor-pointer accent-studio-accent disabled:cursor-not-allowed sm:w-20"
            />

            <span className="w-9 text-right text-xs tabular-nums">
              {pcConnected
                ? "—"
                : `${volume}%`}
            </span>
          </div>
        </div>

        {/* Playback progress */}
        <div className="mt-3 flex items-center gap-3 text-xs tabular-nums text-studio-muted">

          {/* Current playback time */}
          <span className="w-10 shrink-0">
            {pcConnected
              ? "—:—"
              : formatTime(currentTime)}
          </span>

          {/* Seek slider */}
          <input
            type="range"
            min="0"
            max={duration || 1}
            step="0.1"
            value={
              !pcConnected && duration > 0
                ? Math.min(
                    currentTime,
                    duration
                  )
                : 0
            }
            disabled={
              localPlaybackDisabled ||
              duration <= 0
            }
            onChange={handleSeek}
            aria-label="Playback position"
            className="h-1 min-w-0 flex-1 cursor-pointer accent-studio-accent disabled:cursor-not-allowed"
          />

          {/* Total duration */}
          <span className="w-10 shrink-0 text-right">
            {pcConnected
              ? "—:—"
              : formatTime(duration)}
          </span>
        </div>

        {/* External audio information */}
        {pcConnected && (
          <p
            role="status"
            className="mt-2 text-center text-xs text-studio-muted"
          >
            Audio connected. Control playback in the
            original application.
          </p>
        )}

        {/* Audio errors */}
        {(pcError ||
          (!pcConnected && musicError)) && (
          <p
            role="alert"
            className="mt-2 text-center text-xs text-red-300"
          >
            {pcError || musicError}
          </p>
        )}
      </div>
    </footer>
  );
}
