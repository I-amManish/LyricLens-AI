
import type { ReactNode } from "react";

import useMusicPlayer from "./useMusicPlayer";
import usePcAudio from "./usePcAudio";

import { MusicContext } from "./musicContext";

import type {
  MusicContextValue,
} from "./musicContext";

interface MusicProviderProps {
  children: ReactNode;
}

export default function MusicProvider({
  children,
}: MusicProviderProps) {
  // Keep DOM refs inside the provider.
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

  const pc = usePcAudio();

  const localPlaybackDisabled =
    !musicUrl ||
    pc.pcConnected ||
    pc.pcLoading;

  const isPlaying =
    localIsPlaying &&
    !pc.pcConnected;

  const displayedTrackName =
    pc.pcConnected
      ? "PC Audio"
      : trackName || "No track selected";

  const displayedSource =
    pc.pcConnected
      ? "External audio connected"
      : musicUrl
        ? "Local music"
        : "Connect an audio source";

  function togglePcAudio() {
    if (pc.pcConnected) {
      pc.disconnectPcAudio();
    } else {
      void pc.connectPcAudio(
        pausePlayback
      );
    }
  }

  // Share UI state and actions, not DOM refs.
  const contextValue: MusicContextValue = {
    local: {
      currentTime,
      duration,
      volume,
      musicError,
      openMusicSelector,
      togglePlayback,
      handleSeek,
      handleVolumeChange,
    },

    pc,

    isPlaying,
    localPlaybackDisabled,

    displayedTrackName,
    displayedSource,

    togglePcAudio,
  };

  return (
    <MusicContext.Provider
      value={contextValue}
    >
      {/* Single hidden music input */}
      <input
        ref={musicInputRef}
        type="file"
        accept="audio/*"
        aria-label="Select music file"
        className="hidden"
        onChange={(event) =>
          handleMusicSelection(
            event,
            pc.disconnectPcAudio
          )
        }
      />

      {/* Single local audio engine */}
      <audio
        ref={audioRef}
        aria-label="Music audio"
        preload="metadata"
        onPlay={() => {
          if (pc.pcConnected) {
            pausePlayback();
          } else {
            handlePlay();
          }
        }}
        onPause={handlePause}
        onEnded={handlePause}
        onLoadedMetadata={
          handleLoadedMetadata
        }
        onDurationChange={
          handleLoadedMetadata
        }
        onTimeUpdate={
          handleTimeUpdate
        }
        onError={handleMusicError}
      />

      {children}
    </MusicContext.Provider>
  );
}
